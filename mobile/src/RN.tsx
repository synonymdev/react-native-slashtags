import React, {useState} from 'react';
import {
  Button,
  Text,
  useColorScheme,
  NativeModules,
} from 'react-native';
import crypto from 'crypto';
import sodium from 'react-native-libsodium';
import {secp256k1} from 'noise-curve-tiny-secp';

import SlashtagsServer from './SlashtagsServer';

// const {RNSecp256k1, RNOS} = NativeModules;

const RN = () => {
  const [message, setMessage] = useState('');

  return (
    <>
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

      <SlashtagsServer />

      <Text>{message}</Text>
    </>
  );
};

export default RN;
