from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime
from app.models.all_models import MarketplaceItemStatus

class MarketplaceItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    category: str
    condition: Optional[str] = None
    images: Optional[List[str]] = []

class MarketplaceItemCreate(MarketplaceItemBase):
    pass

class MarketplaceItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[MarketplaceItemStatus] = None
    images: Optional[List[str]] = None

class MarketplaceItem(MarketplaceItemBase):
    id: int
    seller_id: int
    status: MarketplaceItemStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
