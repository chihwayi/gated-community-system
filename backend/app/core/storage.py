from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

import json
import os

class StorageClient:
    def __init__(self):
        # Allow overriding endpoint via env var for public access (e.g. 173.212.195.88:9000)
        self.public_endpoint = settings.MINIO_PUBLIC_ENDPOINT
        self.internal_endpoint = settings.MINIO_ENDPOINT
        
        self.access_key = settings.MINIO_ACCESS_KEY
        self.secret_key = settings.MINIO_SECRET_KEY
        self.bucket_name = settings.MINIO_BUCKET_UPLOADS
        self.secure = settings.MINIO_SECURE

        # Client for internal operations (uploading)
        self.client = Minio(
            self.internal_endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure
        )

        # Client for generating public URLs (presigned)
        self.signing_client = Minio(
            self.public_endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure
        )
        
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
            
            # Set public read policy
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                    }
                ]
            }
            self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
            logger.info(f"Set public read policy for bucket: {self.bucket_name}")
                
        except S3Error as e:
            logger.error(f"Error checking/creating bucket: {e}")

    def upload_file(self, file_data, file_name, content_type):
        try:
            result = self.client.put_object(
                self.bucket_name,
                file_name,
                file_data,
                length=-1,
                part_size=10*1024*1024,
                content_type=content_type
            )
            # Return the URL or the object name
            # For local minio: http://localhost:9000/bucket/filename
            # But from outside (browser), localhost:9000 works.
            # From inside (backend), minio:9000 works.
            # We return the object name, and the frontend constructs the URL or we return a presigned URL.
            return f"{self.bucket_name}/{file_name}"
        except S3Error as e:
            logger.error(f"Error uploading file: {e}")
            raise e

    def get_file_url(self, object_name):
        # Generate a presigned URL valid for 1 day
        try:
             # object_name might be "uploads/filename.jpg" or just "filename.jpg"
             # check if bucket name is already in object_name
             if object_name.startswith(f"{self.bucket_name}/"):
                 object_name = object_name.replace(f"{self.bucket_name}/", "")
             
             # Use signing_client to generate URL for browser access (localhost:9000)
             url = self.signing_client.get_presigned_url(
                 "GET",
                 self.bucket_name,
                 object_name,
             )
             
             return url
        except S3Error as e:
            logger.error(f"Error generating url: {e}")
            return None

storage = StorageClient()
