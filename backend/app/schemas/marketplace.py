from typing import Optional, List, Any
from pydantic import BaseModel, validator
from datetime import datetime
from app.models.all_models import MarketplaceItemStatus
from app.core.storage import storage

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
    image_urls: Optional[List[str]] = []

    @validator("image_urls", pre=True, always=True)
    def compute_image_urls(cls, v, values):
        if v:
            return v
        images = values.get("images")
        if images:
            # Generate presigned URLs for each image key
            return [storage.get_file_url(img) for img in images if img]
        return []

    class Config:
        from_attributes = True
