/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import SlashtagsProvider from '@synonymdev/react-native-slashtags';
import Demo from './src/Demo';

const App = () => {
  return (
    <SlashtagsProvider onApiReady={() => console.log('API ready')}>
      <Demo />
    </SlashtagsProvider>
  );
};

export default App;
