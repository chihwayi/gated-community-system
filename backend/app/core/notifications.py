import logging
from typing import List

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        # In a real app, we would initialize SMTP connection or SMS client here
        pass

    async def send_email(self, to_email: str, subject: str, body: str):
        """
        Send an email notification.
        Currently mocks the behavior by logging to console.
        """
        logger.info(f"========== EMAIL NOTIFICATION ==========")
        logger.info(f"TO: {to_email}")
        logger.info(f"SUBJECT: {subject}")
        logger.info(f"BODY: {body}")
        logger.info(f"========================================")
        return True

    async def send_sms(self, phone_number: str, message: str):
        """
        Send an SMS notification.
        Currently mocks the behavior by logging to console.
        """
        logger.info(f"========== SMS NOTIFICATION ==========")
        logger.info(f"TO: {phone_number}")
        logger.info(f"MESSAGE: {message}")
        logger.info(f"======================================")
        return True

notification_service = NotificationService()
