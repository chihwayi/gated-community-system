from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.enabled = True
    
    async def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """
        Mock send email.
        """
        if not self.enabled:
            return False
            
        logger.info(f"--- MOCK EMAIL ---")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body: {body}")
        logger.info(f"------------------")
        return True

    async def send_sms(self, phone_number: str, message: str) -> bool:
        """
        Mock send SMS.
        """
        if not self.enabled:
            return False
            
        logger.info(f"--- MOCK SMS ---")
        logger.info(f"To: {phone_number}")
        logger.info(f"Message: {message}")
        logger.info(f"----------------")
        return True

    async def send_push_notification(self, user_id: int, title: str, body: str) -> bool:
        """
        Mock push notification.
        """
        if not self.enabled:
            return False
            
        logger.info(f"--- MOCK PUSH ---")
        logger.info(f"User ID: {user_id}")
        logger.info(f"Title: {title}")
        logger.info(f"Body: {body}")
        logger.info(f"-----------------")
        return True

notification_service = NotificationService()
