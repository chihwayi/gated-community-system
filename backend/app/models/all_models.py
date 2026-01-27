from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Enum, Float, JSON, func
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

# Enums
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RESIDENT = "resident"
    GUARD = "guard"

class VisitorStatus(str, enum.Enum):
    EXPECTED = "expected"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    EXPIRED = "expired"
    REJECTED = "rejected"

class VisitorType(str, enum.Enum):
    VISITOR = "visitor"
    MAID = "maid"
    CONTRACTOR = "contractor"
    DELIVERY = "delivery"
    OTHER = "other"

class BillStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    ECOCASH = "ecocash"
    ONEMONEY = "onemoney"
    ZIPIT = "zipit"
    BANK_TRANSFER = "bank_transfer"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class IncidentStatus(str, enum.Enum):
    OPEN = "open"
    RESOLVED = "resolved"
    FALSE_ALARM = "false_alarm"

class IncidentPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class NoticePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TicketCategory(str, enum.Enum):
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    SECURITY = "security"
    LANDSCAPING = "landscaping"
    OTHER = "other"

class AmenityStatus(str, enum.Enum):
    AVAILABLE = "available"
    MAINTENANCE = "maintenance"
    CLOSED = "closed"

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class StaffType(str, enum.Enum):
    MAID = "maid"
    DRIVER = "driver"
    COOK = "cook"
    GARDENER = "gardener"
    NANNY = "nanny"
    OTHER = "other"

class StaffStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BLACKLISTED = "blacklisted"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"

class NotificationType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    ALERT = "alert"
    SUCCESS = "success"

class MarketplaceItemStatus(str, enum.Enum):
    AVAILABLE = "available"
    PENDING = "pending"
    SOLD = "sold"

class ParcelStatus(str, enum.Enum):
    AT_GATE = "at_gate"
    COLLECTED = "collected"
    RETURNED = "returned"

class PollStatus(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"

class DocumentCategory(str, enum.Enum):
    BYLAWS = "bylaws"
    MINUTES = "minutes"
    FORM = "form"
    OTHER = "other"

# Models

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True)
    phone_number = Column(String, index=True)
    house_address = Column(String)
    profile_picture = Column(String, nullable=True) # For Face ID / Security
    role = Column(Enum(UserRole), default=UserRole.RESIDENT)
    is_active = Column(Boolean, default=True)
    is_password_changed = Column(Boolean, default=False)
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", backref="properties")

class Blacklist(Base):
    __tablename__ = "blacklist"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    phone_number = Column(String, index=True, nullable=True)
    id_number = Column(String, index=True, nullable=True)
    reason = Column(String, nullable=True)
    
    added_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    added_by = relationship("User")

class PatrolLog(Base):
    __tablename__ = "patrol_logs"

    id = Column(Integer, primary_key=True, index=True)
    guard_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)
    
    guard = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="notifications")

class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Integer, nullable=False) # In cents
    category = Column(String, nullable=False, default="Other")
    condition = Column(String, nullable=True)
    status = Column(Enum(MarketplaceItemStatus), default=MarketplaceItemStatus.AVAILABLE)
    images = Column(JSON, default=[])
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    seller = relationship("User", backref="marketplace_items")

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=False)
    phone_number = Column(String, index=True, nullable=False)
    vehicle_number = Column(String, nullable=True)
    purpose = Column(String, nullable=True)
    visitor_type = Column(Enum(VisitorType), default=VisitorType.VISITOR)
    
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    access_code = Column(String, unique=True, index=True)
    status = Column(Enum(VisitorStatus), default=VisitorStatus.EXPECTED)
    
    valid_until = Column(DateTime(timezone=True), nullable=True)
    expected_arrival = Column(DateTime(timezone=True), nullable=True)
    
    check_in_time = Column(DateTime(timezone=True), nullable=True)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    
    items_carried_in = Column(String, nullable=True)
    items_carried_out = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    host = relationship("User", backref="visitors")

class FeeDefinition(Base):
    __tablename__ = "fee_definitions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    amount = Column(Integer, nullable=False) # In cents
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    resident_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(BillStatus), default=BillStatus.UNPAID)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    resident = relationship("User", backref="bills")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=True)
    amount = Column(Integer, nullable=False)
    method = Column(Enum(PaymentMethod), nullable=False)
    reference = Column(String, nullable=True)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="payments_made")
    bill = relationship("Bill", backref="payments")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=True)
    priority = Column(Enum(IncidentPriority), default=IncidentPriority.MEDIUM)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.OPEN)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reporter = relationship("User", backref="incidents_reported")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    priority = Column(Enum(NoticePriority), default=NoticePriority.MEDIUM)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", backref="notices_created")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(Enum(TicketCategory), default=TicketCategory.OTHER)
    priority = Column(Enum(TicketPriority), default=TicketPriority.MEDIUM)
    status = Column(Enum(TicketStatus), default=TicketStatus.OPEN)
    location = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    created_by = relationship("User", foreign_keys=[created_by_id], backref="tickets_created")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], backref="tickets_assigned")

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    capacity = Column(Integer, nullable=True)
    status = Column(Enum(AmenityStatus), default=AmenityStatus.AVAILABLE)
    open_hours = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    requires_approval = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    amenity = relationship("Amenity", backref="bookings")
    user = relationship("User", backref="bookings")

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False, index=True)
    phone_number = Column(String, unique=True, index=True, nullable=False)
    staff_type = Column(Enum(StaffType), default=StaffType.MAID)
    status = Column(Enum(StaffStatus), default=StaffStatus.ACTIVE)
    access_code = Column(String, unique=True, index=True)
    
    employer_id = Column(Integer, ForeignKey("users.id"), nullable=True) # If null, it's community staff
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    employer = relationship("User", backref="staff")

class StaffAttendance(Base):
    __tablename__ = "staff_attendance"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    check_in = Column(DateTime(timezone=True), nullable=False)
    check_out = Column(DateTime(timezone=True), nullable=True)
    
    staff = relationship("Staff", backref="attendance_records")

# --- New Models for Advanced Features ---

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    license_plate = Column(String, unique=True, index=True, nullable=False)
    make = Column(String, nullable=True)
    model = Column(String, nullable=True)
    color = Column(String, nullable=True)
    parking_slot = Column(String, nullable=True) # Optional slot assignment
    image_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", backref="vehicles")

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    carrier = Column(String, nullable=True) # Amazon, DHL, etc.
    status = Column(Enum(ParcelStatus), default=ParcelStatus.AT_GATE)
    pickup_code = Column(String, unique=True, index=True)
    image_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    collected_at = Column(DateTime(timezone=True), nullable=True)

    recipient = relationship("User", backref="parcels")

class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(Enum(PollStatus), default=PollStatus.OPEN)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    created_by = relationship("User", backref="polls_created")
    options = relationship("PollOption", backref="poll", cascade="all, delete-orphan")
    votes = relationship("PollVote", backref="poll", cascade="all, delete-orphan")

class PollOption(Base):
    __tablename__ = "poll_options"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    text = Column(String, nullable=False)
    vote_count = Column(Integer, default=0)

class PollVote(Base):
    __tablename__ = "poll_votes"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("poll_options.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CommunityDocument(Base):
    __tablename__ = "community_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(Enum(DocumentCategory), default=DocumentCategory.OTHER)
    file_url = Column(String, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploaded_by = relationship("User", backref="documents_uploaded")
