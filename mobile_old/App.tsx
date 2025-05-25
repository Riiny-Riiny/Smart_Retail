/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { Navigation } from './src/navigation';

function App(): JSX.Element {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Navigation />
    </>
  );
}

export default App;
