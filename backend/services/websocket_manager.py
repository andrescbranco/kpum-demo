import asyncio
import json
import logging
from typing import List, Dict, Any
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.lock = asyncio.Lock()
    
    async def add_connection(self, websocket: WebSocket):
        """Add a new WebSocket connection"""
        async with self.lock:
            self.active_connections.append(websocket)
            logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    async def remove_connection(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        async with self.lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
                logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients"""
        if not self.active_connections:
            return
        
        # Add timestamp to message
        message["timestamp"] = datetime.now().isoformat()
        
        # Convert to JSON
        json_message = json.dumps(message)
        
        # Send to all connections
        disconnected = []
        async with self.lock:
            for connection in self.active_connections:
                try:
                    await connection.send_text(json_message)
                except Exception as e:
                    logger.error(f"Error sending message to WebSocket: {e}")
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for connection in disconnected:
                if connection in self.active_connections:
                    self.active_connections.remove(connection)
        
        if disconnected:
            logger.info(f"Removed {len(disconnected)} disconnected WebSocket connections")
    
    async def broadcast_vitals(self, vitals_data: Dict[str, Any]):
        """Broadcast vital signs data to all connected clients"""
        message = {
            "type": "vitals_update",
            "data": vitals_data
        }
        await self.broadcast(message)
    
    async def broadcast_patient_status(self, patient_id: int, status: str, reason: str = None):
        """Broadcast patient status change"""
        message = {
            "type": "status_change",
            "patient_id": patient_id,
            "status": status,
            "reason": reason
        }
        await self.broadcast(message)
    
    async def broadcast_treatment_decision(self, treatment_data: Dict[str, Any]):
        """Broadcast treatment decision"""
        message = {
            "type": "treatment_decision",
            "data": treatment_data
        }
        await self.broadcast(message)
    
    async def broadcast_dispatch_decision(self, dispatch_data: Dict[str, Any]):
        """Broadcast dispatch decision"""
        message = {
            "type": "dispatch_decision",
            "data": dispatch_data
        }
        await self.broadcast(message)
    
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections) 