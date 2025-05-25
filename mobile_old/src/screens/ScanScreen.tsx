import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { RootStackParamList } from '../navigation';
import { Product } from '../types';

type ScanScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scan'>;
};

export const ScanScreen: React.FC<ScanScreenProps> = ({ navigation }) => {
  const handleProductFound = (product: Product) => {
    navigation.replace('ProductDetail', { product });
  };

  return (
    <View style={styles.container}>
      <BarcodeScanner onProductFound={handleProductFound} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
}); 