from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crud_package
from app.models.all_models import User
from app.schemas.package import Package, PackageCreate, PackageUpdate

router = APIRouter()

@router.get("/", response_model=List[Package])
def read_packages(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve packages.
    """
    packages = crud_package.package.get_multi(db, skip=skip, limit=limit)
    return packages

@router.post("/", response_model=Package)
def create_package(
    *,
    db: Session = Depends(deps.get_db),
    package_in: PackageCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new package.
    """
    package = crud_package.package.create(db, obj_in=package_in)
    return package

@router.put("/{id}", response_model=Package)
def update_package(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    package_in: PackageUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a package.
    """
    package = crud_package.package.get(db, id=id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    package = crud_package.package.update(db, db_obj=package, obj_in=package_in)
    return package

@router.delete("/{id}", response_model=Package)
def delete_package(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a package.
    """
    package = crud_package.package.get(db, id=id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    package = crud_package.package.remove(db, id=id)
    return package
