from app.crud.base import CRUDBase
from app.models.all_models import Package
from app.schemas.package import PackageCreate, PackageUpdate

class CRUDPackage(CRUDBase[Package, PackageCreate, PackageUpdate]):
    pass

package = CRUDPackage(Package)
