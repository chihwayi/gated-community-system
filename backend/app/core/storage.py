from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

import json

class StorageClient:
    def __init__(self):
        # Internal client for backend operations (connecting to minio container)
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        
        # External client for generating presigned URLs (accessible by browser)
        # This ensures the signature matches the Host header (localhost:9000)
        # We specify region="us-east-1" to prevent the client from trying to connect to localhost:9000
        # inside the container to auto-detect the region (which would fail).
        self.signing_client = Minio(
            "localhost:9000",
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
            region="us-east-1"
        )
        
        self.bucket_name = settings.MINIO_BUCKET_UPLOADS
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
