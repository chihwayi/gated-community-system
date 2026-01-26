from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_marketplace
from app.schemas import marketplace as schemas
from app.models.all_models import User, MarketplaceItemStatus

router = APIRouter()

@router.get("/", response_model=List[schemas.MarketplaceItem])
def read_marketplace_items(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if category:
        return crud_marketplace.marketplace.get_multi_by_category(db=db, category=category, skip=skip, limit=limit)
    return crud_marketplace.marketplace.get_available(db=db, skip=skip, limit=limit)

@router.get("/me", response_model=List[schemas.MarketplaceItem])
def read_my_items(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_marketplace.marketplace.get_by_seller(db=db, seller_id=current_user.id)

@router.post("/", response_model=schemas.MarketplaceItem)
def create_item(
    item_in: schemas.MarketplaceItemCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_marketplace.marketplace.create_with_seller(db=db, obj_in=item_in, seller_id=current_user.id)

@router.get("/{item_id}", response_model=schemas.MarketplaceItem)
def read_item(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    item = crud_marketplace.marketplace.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.patch("/{item_id}", response_model=schemas.MarketplaceItem)
def update_item(
    item_id: int,
    item_in: schemas.MarketplaceItemUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    item = crud_marketplace.marketplace.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Only seller or admin can update
    if item.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_marketplace.marketplace.update(db=db, db_obj=item, obj_in=item_in)

@router.delete("/{item_id}", response_model=schemas.MarketplaceItem)
def delete_item(
    item_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    item = crud_marketplace.marketplace.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Only seller or admin can delete
    if item.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return crud_marketplace.marketplace.remove(db=db, id=item_id)
