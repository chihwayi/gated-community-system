from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.all_models import Bill, Payment, FeeDefinition, BillStatus, PaymentStatus
from app.schemas import financial as schemas

# FeeDefinition CRUD
def create_fee_definition(db: Session, fee: schemas.FeeDefinitionCreate, tenant_id: int) -> FeeDefinition:
    db_fee = FeeDefinition(
        name=fee.name,
        description=fee.description,
        amount=fee.amount,
        is_active=fee.is_active,
        tenant_id=tenant_id
    )
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)
    return db_fee

def get_fee_definitions(db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[FeeDefinition]:
    return db.query(FeeDefinition).filter(FeeDefinition.tenant_id == tenant_id).offset(skip).limit(limit).all()

def get_active_fee_definitions(db: Session, tenant_id: int) -> List[FeeDefinition]:
    return db.query(FeeDefinition).filter(FeeDefinition.is_active == True, FeeDefinition.tenant_id == tenant_id).all()

def get_fee_definition(db: Session, fee_id: int) -> Optional[FeeDefinition]:
    return db.query(FeeDefinition).filter(FeeDefinition.id == fee_id).first()

def update_fee_definition(db: Session, db_fee: FeeDefinition, fee_update: schemas.FeeDefinitionUpdate) -> FeeDefinition:
    update_data = fee_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_fee, key, value)
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)
    return db_fee

def delete_fee_definition(db: Session, fee_id: int) -> Optional[FeeDefinition]:
    db_fee = db.query(FeeDefinition).filter(FeeDefinition.id == fee_id).first()
    if db_fee:
        db.delete(db_fee)
        db.commit()
    return db_fee


# Bill CRUD
def create_bill(db: Session, bill: schemas.BillCreate, tenant_id: int) -> Bill:
    db_bill = Bill(
        resident_id=bill.resident_id,
        amount=bill.amount,
        description=bill.description,
        due_date=bill.due_date,
        status=bill.status,
        tenant_id=tenant_id
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)
    return db_bill

def get_bills(db: Session, tenant_id: int, skip: int = 0, limit: int = 100, resident_id: Optional[int] = None) -> List[Bill]:
    query = db.query(Bill).filter(Bill.tenant_id == tenant_id)
    if resident_id:
        query = query.filter(Bill.resident_id == resident_id)
    return query.order_by(Bill.created_at.desc()).offset(skip).limit(limit).all()

def get_bill(db: Session, bill_id: int, tenant_id: Optional[int] = None) -> Optional[Bill]:
    query = db.query(Bill).filter(Bill.id == bill_id)
    if tenant_id:
        query = query.filter(Bill.tenant_id == tenant_id)
    return query.first()

# Payment CRUD
def create_payment(db: Session, payment: schemas.PaymentCreate, user_id: int, tenant_id: int) -> Payment:
    db_payment = Payment(
        user_id=user_id,
        bill_id=payment.bill_id,
        amount=payment.amount,
        method=payment.method,
        reference=payment.reference,
        notes=payment.notes,
        status=PaymentStatus.PENDING, # Default to pending
        tenant_id=tenant_id
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

def get_payments(
    db: Session, 
    tenant_id: int,
    skip: int = 0, 
    limit: int = 100, 
    user_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> List[Payment]:
    query = db.query(Payment).filter(Payment.tenant_id == tenant_id)
    if user_id:
        query = query.filter(Payment.user_id == user_id)
    if start_date:
        query = query.filter(Payment.created_at >= start_date)
    if end_date:
        query = query.filter(Payment.created_at <= end_date)
    return query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()

def update_payment_status(db: Session, payment_id: int, status: PaymentStatus, tenant_id: int) -> Optional[Payment]:
    payment = db.query(Payment).filter(Payment.id == payment_id, Payment.tenant_id == tenant_id).first()
    if payment:
        payment.status = status
        
        # If payment is verified and linked to a bill, update bill status
        if status == PaymentStatus.VERIFIED and payment.bill_id:
            bill = get_bill(db, payment.bill_id, tenant_id) # Pass tenant_id for safety
            if bill:
                # We need to refresh the bill's payments relationship to include the current one (if not already)
                # But querying explicitly is safer
                db.refresh(bill)
                # Recalculate total paid from DB to be safe
                total_paid = 0
                paid_payments = db.query(Payment).filter(
                    Payment.bill_id == bill.id, 
                    Payment.status == PaymentStatus.VERIFIED,
                    Payment.tenant_id == tenant_id
                ).all()
                total_paid = sum(p.amount for p in paid_payments)
                
                if total_paid >= bill.amount:
                    bill.status = BillStatus.PAID
                elif total_paid > 0:
                    bill.status = BillStatus.PARTIAL
                db.add(bill)

        db.add(payment)
        db.commit()
        db.refresh(payment)
    return payment
