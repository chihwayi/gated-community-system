import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

class CommunicationService:
    def __init__(self):
        pass

    def send_sms(self, phone_number: str, message: str) -> bool:
        """
        Send SMS (Mock)
        In production, integrate with Twilio, Msg91, etc.
        """
        logger.info(f"[SMS SERVICE] Sending SMS to {phone_number}")
        logger.info(f"[SMS CONTENT] {message}")
        return True

    def send_whatsapp(self, phone_number: str, message: str, media_url: Optional[str] = None) -> bool:
        """
        Send WhatsApp Message (Mock)
        In production, integrate with Twilio API for WhatsApp or Meta Business API.
        """
        logger.info(f"[WHATSAPP SERVICE] Sending WhatsApp to {phone_number}")
        logger.info(f"[WHATSAPP CONTENT] {message}")
        if media_url:
            logger.info(f"[WHATSAPP MEDIA] {media_url}")
        return True

    def send_email(self, email: str, subject: str, body: str) -> bool:
        """
        Send Email (Mock)
        """
        logger.info(f"[MOCK EMAIL] To: {email} | Subject: {subject} | Body: {body}")
        return True

    def send_push_notification(self, token: str, title: str, body: str, data: Optional[dict] = None) -> bool:
        """
        Send Push Notification via Expo
        """
        if not token:
             logger.warning("No push token provided")
             return False

        try:
            response = PushClient().publish(
                PushMessage(to=token, title=title, body=body, data=data)
            )
        except PushServerError as exc:
            logger.error(f"PushServerError: {exc.errors}")
            return False
        except (ConnectionError, HTTPError) as exc:
            logger.error(f"ConnectionError/HTTPError: {exc}")
            return False

        try:
            response.validate_response()
        except DeviceNotRegisteredError:
            logger.warning(f"DeviceNotRegisteredError: {token}")
            return False
        except PushTicketError as exc:
            logger.error(f"PushTicketError: {exc.errors}")
            return False
        
        logger.info(f"[PUSH SENT] Token: {token} | Title: {title}")
        return True

    def send_access_code(self, phone_number: str, access_code: str, visitor_name: str) -> bool:
        """
        Dual Send: Send Access Code via both SMS and WhatsApp
        """
        message = f"Hello {visitor_name}, your access code for Gated Community is: {access_code}. Please show this to the guard at the gate."
        
        # Send via SMS
        sms_sent = self.send_sms(phone_number, message)
        
        # Send via WhatsApp
        whatsapp_sent = self.send_whatsapp(phone_number, message)
        
        return sms_sent and whatsapp_sent

communication_service = CommunicationService()
