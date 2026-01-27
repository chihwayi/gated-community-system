from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.all_models import MarketplaceItem, MarketplaceItemStatus
from app.schemas.marketplace import MarketplaceItemCreate, MarketplaceItemUpdate

class CRUDMarketplace(CRUDBase[MarketplaceItem, MarketplaceItemCreate, MarketplaceItemUpdate]):
    def create_with_seller(self, db: Session, *, obj_in: MarketplaceItemCreate, seller_id: int, tenant_id: int) -> MarketplaceItem:
        db_obj = MarketplaceItem(
            **obj_in.dict(),
            seller_id=seller_id,
            tenant_id=tenant_id,
            status=MarketplaceItemStatus.AVAILABLE
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_category(self, db: Session, *, category: str, tenant_id: int, skip: int = 0, limit: int = 100) -> List[MarketplaceItem]:
        return db.query(MarketplaceItem).filter(
            MarketplaceItem.tenant_id == tenant_id,
            MarketplaceItem.category == category,
            MarketplaceItem.status == MarketplaceItemStatus.AVAILABLE
        ).offset(skip).limit(limit).all()

    def get_available(self, db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[MarketplaceItem]:
        return db.query(MarketplaceItem).filter(
            MarketplaceItem.tenant_id == tenant_id,
            MarketplaceItem.status == MarketplaceItemStatus.AVAILABLE
        ).order_by(MarketplaceItem.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_seller(self, db: Session, seller_id: int, tenant_id: int) -> List[MarketplaceItem]:
        return db.query(MarketplaceItem).filter(
            MarketplaceItem.tenant_id == tenant_id,
            MarketplaceItem.seller_id == seller_id
        ).all()

marketplace = CRUDMarketplace(MarketplaceItem)
