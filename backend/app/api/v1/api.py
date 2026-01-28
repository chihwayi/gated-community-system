from fastapi import APIRouter
from app.api.v1.endpoints import visitors, login, users, financial, notices, incidents, tickets, amenities, bookings, staff, notifications, marketplace, utils, vehicles, parcels, polls, documents, mfa, security, upload, properties, tenants, packages, stats

api_router = APIRouter()

@api_router.get("/health", tags=["system"])
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(visitors.router, prefix="/visitors", tags=["visitors"])
api_router.include_router(financial.router, prefix="/financial", tags=["financial"])
api_router.include_router(notices.router, prefix="/notices", tags=["notices"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(amenities.router, prefix="/amenities", tags=["amenities"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(staff.router, prefix="/staff", tags=["staff"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(marketplace.router, prefix="/marketplace", tags=["marketplace"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(parcels.router, prefix="/parcels", tags=["parcels"])
api_router.include_router(polls.router, prefix="/polls", tags=["polls"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(mfa.router, prefix="/mfa", tags=["mfa"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(tenants.router, prefix="/tenants", tags=["tenants"])
api_router.include_router(packages.router, prefix="/packages", tags=["packages"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
