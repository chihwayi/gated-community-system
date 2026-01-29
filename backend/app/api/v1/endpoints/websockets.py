from typing import List, Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.api import deps
from app.models.all_models import User, UserRole

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # tenant_id -> list of (user_id, websocket)
        self.active_connections: Dict[int, List[Dict]] = {}

    async def connect(self, websocket: WebSocket, user: User):
        await websocket.accept()
        if user.tenant_id not in self.active_connections:
            self.active_connections[user.tenant_id] = []
        
        self.active_connections[user.tenant_id].append({
            "user_id": user.id,
            "role": user.role,
            "websocket": websocket
        })
        print(f"User {user.id} ({user.role}) connected to WS for Tenant {user.tenant_id}")

    def disconnect(self, websocket: WebSocket, user: User):
        if user.tenant_id in self.active_connections:
            self.active_connections[user.tenant_id] = [
                conn for conn in self.active_connections[user.tenant_id] 
                if conn["websocket"] != websocket
            ]

    async def broadcast_to_tenant(self, message: dict, tenant_id: int):
        if tenant_id in self.active_connections:
            for connection in self.active_connections[tenant_id]:
                try:
                    await connection["websocket"].send_json(message)
                except Exception as e:
                    print(f"Error sending to WS: {e}")

    async def broadcast_to_role(self, message: dict, tenant_id: int, roles: List[UserRole]):
        if tenant_id in self.active_connections:
            for connection in self.active_connections[tenant_id]:
                if connection["role"] in roles:
                    try:
                        await connection["websocket"].send_json(message)
                    except Exception as e:
                        print(f"Error sending to WS: {e}")

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        # Validate token
        user = await deps.get_current_user_ws(token)
        if not user:
            await websocket.close(code=4003)
            return

        await manager.connect(websocket, user)
        
        try:
            while True:
                # Keep connection alive
                data = await websocket.receive_text()
                # We can handle client messages here if needed (e.g., ping/pong)
        except WebSocketDisconnect:
            manager.disconnect(websocket, user)
            
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.close()
        except:
            pass
