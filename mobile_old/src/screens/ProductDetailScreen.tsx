import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation';
import { PriceHistory } from '../types';
import api from '../services/api';

type ProductDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
  route: RouteProp<RootStackParamList, 'ProductDetail'>;
};

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  route,
}) => {
  const { product } = route.params;
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriceHistory();
  }, []);

  const loadPriceHistory = async () => {
    try {
      const history = await api.getPriceHistory(product.id);
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading price history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.sku}>SKU: {product.sku}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Current Price</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Stock Level</Text>
        <Text style={styles.stock}>{product.stock} units</Text>
      </View>

      {product.description && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Price History</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <View>
            {priceHistory.map((entry, index) => (
              <View key={entry.id} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </Text>
                <Text style={styles.historyPrice}>
                  ${entry.price.toFixed(2)}
                </Text>
                <Text style={styles.historyCompetitor}>
                  {entry.competitor?.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  sku: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  infoSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  price: {
    fontSize: 32,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  stock: {
    fontSize: 20,
    color: '#4CAF50',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyDate: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  historyPrice: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  historyCompetitor: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
}); 