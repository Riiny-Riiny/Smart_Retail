import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Product, PriceAlert, PriceHistory, OfflineQueueItem } from '../types';

const API_URL = 'http://localhost:3000/api';

class ApiService {
  private static instance: ApiService;
  private offlineQueue: OfflineQueueItem[] = [];

  private constructor() {
    this.initializeOfflineQueue();
    this.startQueueProcessor();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async initializeOfflineQueue() {
    try {
      const queueData = await AsyncStorage.getItem('offlineQueue');
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error initializing offline queue:', error);
    }
  }

  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private async startQueueProcessor() {
    setInterval(async () => {
      const isConnected = (await NetInfo.fetch()).isConnected;
      if (isConnected) {
        await this.processOfflineQueue();
      }
    }, 30000); // Check every 30 seconds
  }

  private async processOfflineQueue() {
    for (const item of this.offlineQueue) {
      if (item.status === 'PENDING') {
        try {
          item.status = 'PROCESSING';
          await this.saveOfflineQueue();

          switch (item.type) {
            case 'SCAN':
              await this.lookupProduct(item.data.barcode);
              break;
            case 'ALERT_READ':
              await this.markAlertAsRead(item.data.alertId);
              break;
            case 'PRICE_UPDATE':
              await this.updatePrice(item.data.productId, item.data.price);
              break;
          }

          // Remove successfully processed item
          this.offlineQueue = this.offlineQueue.filter(i => i.id !== item.id);
          await this.saveOfflineQueue();
        } catch (error) {
          item.status = 'FAILED';
          item.retryCount++;
          await this.saveOfflineQueue();
          console.error(`Error processing queue item ${item.id}:`, error);
        }
      }
    }
  }

  async lookupProduct(barcode: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_URL}/products/lookup?barcode=${barcode}`);
      if (!response.ok) throw new Error('Product not found');
      return await response.json();
    } catch (error) {
      if (!(await NetInfo.fetch()).isConnected) {
        // Store scan request in offline queue
        this.offlineQueue.push({
          id: Date.now().toString(),
          type: 'SCAN',
          data: { barcode },
          timestamp: new Date(),
          status: 'PENDING',
          retryCount: 0,
        });
        await this.saveOfflineQueue();
      }
      throw error;
    }
  }

  async getAlerts(): Promise<PriceAlert[]> {
    try {
      const response = await fetch(`${API_URL}/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return await response.json();
    } catch (error) {
      // Return cached alerts if offline
      const cachedAlerts = await AsyncStorage.getItem('cachedAlerts');
      return cachedAlerts ? JSON.parse(cachedAlerts) : [];
    }
  }

  async getPriceHistory(productId: string): Promise<PriceHistory[]> {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/price-history`);
      if (!response.ok) throw new Error('Failed to fetch price history');
      const history = await response.json();
      
      // Cache the price history
      await AsyncStorage.setItem(`priceHistory_${productId}`, JSON.stringify(history));
      return history;
    } catch (error) {
      // Return cached history if offline
      const cachedHistory = await AsyncStorage.getItem(`priceHistory_${productId}`);
      return cachedHistory ? JSON.parse(cachedHistory) : [];
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}/read`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark alert as read');
    } catch (error) {
      if (!(await NetInfo.fetch()).isConnected) {
        this.offlineQueue.push({
          id: Date.now().toString(),
          type: 'ALERT_READ',
          data: { alertId },
          timestamp: new Date(),
          status: 'PENDING',
          retryCount: 0,
        });
        await this.saveOfflineQueue();
      }
      throw error;
    }
  }

  async updatePrice(productId: string, price: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price }),
      });
      if (!response.ok) throw new Error('Failed to update price');
    } catch (error) {
      if (!(await NetInfo.fetch()).isConnected) {
        this.offlineQueue.push({
          id: Date.now().toString(),
          type: 'PRICE_UPDATE',
          data: { productId, price },
          timestamp: new Date(),
          status: 'PENDING',
          retryCount: 0,
        });
        await this.saveOfflineQueue();
      }
      throw error;
    }
  }
}

export default ApiService.getInstance(); 