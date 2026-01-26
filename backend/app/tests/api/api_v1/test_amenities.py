from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core.config import settings
from app.tests.utils.utils import random_lower_string
from app.tests.utils.user import authentication_token_from_email
from app.main import app

def test_create_amenity(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    data = {
        "name": "Pool",
        "description": "Swimming Pool",
        "capacity": 50,
        "status": "available",
        "requires_approval": False
    }
    response = client.post(
        f"{settings.API_V1_STR}/amenities/", headers=superuser_token_headers, json=data
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["description"] == data["description"]
    assert "id" in content

def test_read_amenities(
    client: TestClient, superuser_token_headers: dict, db: Session
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/amenities/", headers=superuser_token_headers
    )
    assert response.status_code == 200
    content = response.json()
    assert isinstance(content, list)
