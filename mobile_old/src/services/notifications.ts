import PushNotification from 'react-native-push-notification';
import { PriceAlert } from '../types';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.configure();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'price-alerts',
        channelName: 'Price Alerts',
        channelDescription: 'Notifications for price changes',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel 'price-alerts' created: ${created}`)
    );
  }

  showPriceAlert(alert: PriceAlert) {
    const direction = alert.percentageChange > 0 ? 'increased' : 'decreased';
    const magnitude = Math.abs(alert.percentageChange).toFixed(1);

    PushNotification.localNotification({
      channelId: 'price-alerts',
      title: `${alert.significance} Price Alert`,
      message: `${alert.product?.name} price has ${direction} by ${magnitude}%`,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      data: { alertId: alert.id },
    });
  }

  showOfflineSync() {
    PushNotification.localNotification({
      channelId: 'price-alerts',
      title: 'Offline Data Synced',
      message: 'Your offline changes have been synchronized with the server',
      playSound: true,
      soundName: 'default',
    });
  }

  showScanError(error: string) {
    PushNotification.localNotification({
      channelId: 'price-alerts',
      title: 'Scan Error',
      message: error,
      playSound: true,
      soundName: 'default',
    });
  }
}

export default NotificationService.getInstance(); 