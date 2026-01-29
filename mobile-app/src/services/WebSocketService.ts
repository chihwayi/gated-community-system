import { API_URL } from '../config/api';
import { Storage } from '../utils/storage';

type WebSocketListener = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: WebSocketListener[] = [];
  private reconnectInterval: NodeJS.Timeout | null = null;

  async connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

    try {
      const token = await Storage.getToken();
      if (!token) return;

      // API_URL is http://... need to convert to ws://...
      const wsProtocol = API_URL.startsWith('https') ? 'wss' : 'ws';
      const cleanUrl = API_URL.replace(/^https?:\/\//, '');
      const baseUrl = cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
      const wsUrl = `${wsProtocol}://${baseUrl}ws?token=${token}`;
      
      console.log('Connecting to WS:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket Connected');
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log('WS Message:', data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('WS Parse Error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket Disconnected');
        this.ws = null;
        this.attemptReconnect();
      };

      this.ws.onerror = (e: any) => {
        console.log('WebSocket Error:', e.message);
      };

    } catch (error) {
      console.error('WS Connection Error:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
    }
  }

  addListener(listener: WebSocketListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(listener => listener(data));
  }

  private attemptReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        console.log('Attempting WS reconnect...');
        this.connect();
      }, 5000);
    }
  }
}

export const webSocketService = new WebSocketService();
