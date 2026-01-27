from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_financial
from app.schemas import financial as schemas
from app.models.all_models import User, UserRole, PaymentStatus, FeeDefinition, Bill, BillStatus
from datetime import datetime, timedelta
from app.core import notifications as notification_service

router = APIRouter()

# --- Fee Definitions ---

@router.post("/fees", response_model=schemas.FeeDefinition)
def create_fee_definition(
    fee_in: schemas.FeeDefinitionCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Create a new fee definition. (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    return crud_financial.create_fee_definition(db=db, fee=fee_in, tenant_id=current_user.tenant_id)

@router.get("/fees", response_model=List[schemas.FeeDefinition])
def read_fee_definitions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve fee definitions."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
    return crud_financial.get_fee_definitions(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit)

@router.put("/fees/{fee_id}", response_model=schemas.FeeDefinition)
def update_fee_definition(
    fee_id: int,
    fee_in: schemas.FeeDefinitionUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Update a fee definition. (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    fee = crud_financial.get_fee_definition(db, fee_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee definition not found")
    if current_user.tenant_id and fee.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Fee definition not found")
    return crud_financial.update_fee_definition(db=db, db_fee=fee, fee_update=fee_in)

@router.delete("/fees/{fee_id}", response_model=schemas.FeeDefinition)
def delete_fee_definition(
    fee_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Delete a fee definition. (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    fee = crud_financial.get_fee_definition(db, fee_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee definition not found")
    if current_user.tenant_id and fee.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Fee definition not found")
    return crud_financial.delete_fee_definition(db=db, fee_id=fee_id)

# --- Bills ---

@router.post("/bills/generate-monthly", response_model=List[schemas.Bill])
async def generate_monthly_bills(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Generate monthly bills for all active residents. (Admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    # 1. Get default levy fee
    default_fee = db.query(FeeDefinition).filter(
        FeeDefinition.name == "Monthly Levy",
        FeeDefinition.is_active == True,
        FeeDefinition.tenant_id == current_user.tenant_id
    ).first()
    
    if not default_fee:
        raise HTTPException(status_code=400, detail="Active 'Monthly Levy' fee definition not found")

    # 2. Get all active residents
    residents = db.query(User).filter(
        User.role == UserRole.RESIDENT,
        User.is_active == True,
        User.tenant_id == current_user.tenant_id
    ).all()
    
    generated_bills = []
    
    # 3. Create bill for each resident if not already billed for this month
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    due_date = current_month_start + timedelta(days=25) # Due on 25th
    
    for resident in residents:
        bill_description = f"Monthly Levy - {current_month_start.strftime('%B %Y')}"
        
        # Check if bill exists for this month
        existing_bill = db.query(Bill).filter(
            Bill.resident_id == resident.id,
            Bill.description == bill_description,
            Bill.created_at >= current_month_start
        ).first()
        
        if not existing_bill:
            bill_in = schemas.BillCreate(
                resident_id=resident.id,
                amount=default_fee.amount,
                description=bill_description,
                due_date=due_date
            )
            bill = crud_financial.create_bill(db=db, bill=bill_in)
            generated_bills.append(bill)
            
            # Send Email Notification
            if resident.email:
                await notification_service.send_email(
                    to_email=resident.email,
                    subject="New Bill Generated",
                    body=f"Dear {resident.full_name}, your monthly levy bill for {current_month_start.strftime('%B %Y')} of ${(default_fee.amount/100):.2f} has been generated. Please view it in your dashboard."
                )
            
    return generated_bills

@router.post("/bills", response_model=schemas.Bill)
def create_bill(
    bill_in: schemas.BillCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Create a new bill. (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    # Verify resident belongs to the same tenant
    resident = db.query(User).filter(User.id == bill_in.resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
        
    if resident.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=400, detail="Resident does not belong to your tenant")
        
    return crud_financial.create_bill(db=db, bill=bill_in)

@router.get("/bills", response_model=List[schemas.Bill])
def read_bills(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve bills."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    if current_user.role == UserRole.ADMIN:
        return crud_financial.get_bills(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit)
    else:
        return crud_financial.get_bills(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, resident_id=current_user.id)

# --- Payments ---

@router.post("/payments", response_model=schemas.Payment)
def create_payment(
    payment_in: schemas.PaymentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Record a payment. Residents can create their own payments."""
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")
        
    # Check if bill belongs to tenant (if bill_id provided)
    if payment_in.bill_id:
        bill = crud_financial.get_bill(db, payment_in.bill_id)
        if not bill:
             raise HTTPException(status_code=404, detail="Bill not found")
        # Bill -> Resident -> Tenant
        bill_resident = db.query(User).filter(User.id == bill.resident_id).first()
        if not bill_resident or bill_resident.tenant_id != current_user.tenant_id:
             raise HTTPException(status_code=404, detail="Bill not found")

    return crud_financial.create_payment(db=db, payment=payment_in, user_id=current_user.id, tenant_id=current_user.tenant_id)

@router.get("/payments", response_model=List[schemas.Payment])
def read_payments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve payments."""
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    if current_user.role == UserRole.ADMIN:
        return crud_financial.get_payments(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, start_date=start, end_date=end)
    else:
        return crud_financial.get_payments(db=db, tenant_id=current_user.tenant_id, skip=skip, limit=limit, user_id=current_user.id, start_date=start, end_date=end)

@router.put("/payments/{payment_id}/status", response_model=schemas.Payment)
def update_payment_status(
    payment_id: int,
    status: PaymentStatus,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Update payment status (Verify/Reject). (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a tenant")

    payment = crud_financial.update_payment_status(db=db, payment_id=payment_id, status=status, tenant_id=current_user.tenant_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
