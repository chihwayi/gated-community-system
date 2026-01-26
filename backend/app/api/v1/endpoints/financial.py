from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_financial
from app.schemas import financial as schemas
from app.models.all_models import User, UserRole, PaymentStatus

from datetime import datetime

router = APIRouter()

# --- Fee Definitions ---

@router.post("/fees", response_model=schemas.FeeDefinition)
def create_fee_definition(
    fee_in: schemas.FeeDefinitionCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Create a new fee definition. (Admin only)"""
    return crud_financial.create_fee_definition(db=db, fee=fee_in)

@router.get("/fees", response_model=List[schemas.FeeDefinition])
def read_fee_definitions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve fee definitions."""
    return crud_financial.get_fee_definitions(db=db, skip=skip, limit=limit)

@router.put("/fees/{fee_id}", response_model=schemas.FeeDefinition)
def update_fee_definition(
    fee_id: int,
    fee_in: schemas.FeeDefinitionUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Update a fee definition. (Admin only)"""
    fee = crud_financial.get_fee_definition(db, fee_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee definition not found")
    return crud_financial.update_fee_definition(db=db, db_fee=fee, fee_update=fee_in)

@router.delete("/fees/{fee_id}", response_model=schemas.FeeDefinition)
def delete_fee_definition(
    fee_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Delete a fee definition. (Admin only)"""
    fee = crud_financial.delete_fee_definition(db=db, fee_id=fee_id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee definition not found")
    return fee

# --- Bills ---

@router.post("/bills", response_model=schemas.Bill)
def create_bill(
    bill_in: schemas.BillCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Create a new bill. (Admin only)"""
    return crud_financial.create_bill(db=db, bill=bill_in)

@router.get("/bills", response_model=List[schemas.Bill])
def read_bills(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Retrieve bills."""
    if current_user.role == UserRole.ADMIN:
        return crud_financial.get_bills(db=db, skip=skip, limit=limit)
    else:
        return crud_financial.get_bills(db=db, skip=skip, limit=limit, resident_id=current_user.id)

# --- Payments ---

@router.post("/payments", response_model=schemas.Payment)
def create_payment(
    payment_in: schemas.PaymentCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Record a payment. Residents can create their own payments."""
    return crud_financial.create_payment(db=db, payment=payment_in, user_id=current_user.id)

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

    if current_user.role == UserRole.ADMIN:
        return crud_financial.get_payments(db=db, skip=skip, limit=limit, start_date=start, end_date=end)
    else:
        return crud_financial.get_payments(db=db, skip=skip, limit=limit, user_id=current_user.id, start_date=start, end_date=end)

@router.put("/payments/{payment_id}/status", response_model=schemas.Payment)
def update_payment_status(
    payment_id: int,
    status: PaymentStatus,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser)
) -> Any:
    """Update payment status (Verify/Reject). (Admin only)"""
    payment = crud_financial.update_payment_status(db=db, payment_id=payment_id, status=status)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
