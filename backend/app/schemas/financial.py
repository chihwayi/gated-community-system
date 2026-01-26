from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.all_models import BillStatus, PaymentMethod, PaymentStatus

# FeeDefinition Schemas
class FeeDefinitionBase(BaseModel):
    name: str
    description: Optional[str] = None
    amount: int
    is_active: bool = True

class FeeDefinitionCreate(FeeDefinitionBase):
    pass

class FeeDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[int] = None
    is_active: Optional[bool] = None

class FeeDefinition(FeeDefinitionBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# Payment Schemas
class PaymentBase(BaseModel):
    amount: int
    method: PaymentMethod
    reference: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    bill_id: Optional[int] = None

class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    notes: Optional[str] = None

class Payment(PaymentBase):
    id: int
    user_id: int
    bill_id: Optional[int] = None
    status: PaymentStatus
    created_at: datetime

    class Config:
        orm_mode = True

# Bill Schemas
class BillBase(BaseModel):
    amount: int
    description: str
    due_date: datetime
    status: BillStatus = BillStatus.UNPAID

class BillCreate(BillBase):
    resident_id: int

class BillUpdate(BaseModel):
    status: Optional[BillStatus] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class Bill(BillBase):
    id: int
    resident_id: int
    created_at: datetime
    payments: List[Payment] = []

    class Config:
        orm_mode = True
