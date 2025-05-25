import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
import logger from './logger';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
}

class AlertWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocketClient> = new Set();

  constructor(server: ReturnType<typeof createServer>) {
    this.wss = new WebSocketServer({ server, path: '/ws/alerts' });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocketClient) => {
      ws.isAlive = true;
      this.clients.add(ws);

      logger.info('New WebSocket client connected');

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('WebSocket client disconnected');
      });
    });

    // Set up heartbeat
    setInterval(() => {
      this.clients.forEach((ws) => {
        if (!ws.isAlive) {
          this.clients.delete(ws);
          ws.terminate();
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  broadcastAlert(alert: any) {
    const message = JSON.stringify(alert);
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          logger.error('Error sending alert to client:', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    });

    logger.info('Alert broadcast to clients', {
      alertId: alert.id,
      clientCount: this.clients.size,
    });
  }

  getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

let wsServer: AlertWebSocketServer | null = null;

export function initializeWebSocketServer(httpServer: ReturnType<typeof createServer>) {
  if (!wsServer) {
    wsServer = new AlertWebSocketServer(httpServer);
    logger.info('WebSocket server initialized');
  }
  return wsServer;
}

export function getWebSocketServer(): AlertWebSocketServer {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
} 