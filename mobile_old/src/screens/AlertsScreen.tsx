import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { PriceAlert } from '../types';
import api from '../services/api';

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Alerts'>;
};

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleAlertPress = async (alert: PriceAlert) => {
    try {
      await api.markAlertAsRead(alert.id);
      if (alert.product) {
        navigation.navigate('ProductDetail', { product: alert.product });
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const renderAlert = ({ item: alert }: { item: PriceAlert }) => {
    const direction = alert.percentageChange > 0 ? 'increased' : 'decreased';
    const magnitude = Math.abs(alert.percentageChange).toFixed(1);
    const color = alert.percentageChange > 0 ? '#ff4444' : '#44bb44';

    return (
      <TouchableOpacity
        style={styles.alertItem}
        onPress={() => handleAlertPress(alert)}
      >
        <View style={styles.alertHeader}>
          <Text style={styles.alertTitle}>{alert.product?.name}</Text>
          <Text style={[styles.alertSignificance, { color }]}>
            {alert.significance}
          </Text>
        </View>

        <Text style={styles.alertMessage}>
          Price has {direction} by {magnitude}%
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Old Price:</Text>
          <Text style={styles.priceValue}>
            ${alert.oldPrice.toFixed(2)}
          </Text>
          <Text style={styles.priceLabel}>New Price:</Text>
          <Text style={styles.priceValue}>
            ${alert.newPrice.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.timestamp}>
          {new Date(alert.timestamp).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={alerts}
      renderItem={renderAlert}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No price alerts</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  alertSignificance: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginRight: 15,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 