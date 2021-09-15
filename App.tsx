/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import './shim.js';
import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  Text,
  useColorScheme,
  NativeModules,
} from 'react-native';
import crypto from 'crypto';
import sodium from 'react-native-libsodium';
// import secp256k1 from 'react-native-secp256k1';
// import secp256k1 from 'tiny-secp256k1';
import {secp256k1} from 'noise-curve-tiny-secp';

import {createAuth} from '@synonymdev/slashtags-auth';

// const {RNSecp256k1, RNOS} = NativeModules;

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [message, setMessage] = useState('');

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Button
        title={'Crypto test'}
        onPress={() => {
          const randomBytes = crypto.randomBytes(32).toString('base64');
          setMessage(`Crypto random bytes:\n${randomBytes}`);
        }}
      />

      <Button
        title={'Sodium test'}
        onPress={() => {
          const rand = Buffer.allocUnsafe(32); // Cryptographically random data
          sodium.randombytes_buf(rand);

          setMessage(`Sodium random bytes:\n${rand.toString('base64')}`);
        }}
      />

      <Button
        title={'Secp256k1 test'}
        onPress={async () => {
          const pair = secp256k1.generateKeyPair();
          //
          // setMessage('secp256k1 random bytes:\n');
          //
          // console.warn('FIX lib');
          try {
            console.log(pair);
          } catch (e) {
            alert(e);
          }
        }}
      />

      <Button
        title={'Slashtags auth test'}
        onPress={async () => {
          const pair = secp256k1.generateKeyPair();

          const auth = createAuth(pair, {})

          const message = auth.newChallenge(10)

          setMessage(`${JSON.stringify(message)}`);
        }}
      />

      <Text>{message}</Text>
    </SafeAreaView>
  );
};

export default App;
