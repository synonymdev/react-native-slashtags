import nodejs from 'nodejs-mobile-react-native';

///import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

// "@synonymdev/slashtags-auth": "^0.1.4",
//   "@synonymdev/slashtags-url": "^0.1.1",
//   "noise-curve-secp256k1": "git+ssh://git@github.com/synonymdev/noise-curve-tiny-secp256k1.git"

import React, {useState, useEffect} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {
  Initiator,
  KeyPair,
  Responder,
} from '@synonymdev/slashtags-auth/types/interfaces';

import {SlashtagsURL} from '@synonymdev/slashtags-url/types/interfaces';

// import {createAuth} from '@synonymdev/slashtags-auth';
// import {secp256k1 as curve} from 'noise-curve-tiny-secp';
// import * as SlashtagsURL from '@synonymdev/slashtags-url';
// import bint from 'bint8array';
// import crypto from 'crypto';
// import sodium from 'react-native-libsodium';

const Wallet = () => {
  const [actionURL, setActionURL] = useState(
    'slashtags:b2iaqaamaaqjcbw5htiftuksya3xkgxzzhrqwz4qtk6oxn7u74l23t2fthlnx3ked/#ugAR7InJlbW90ZVBLIjoiMDNmYzg4OGFlOTMxNDExZmY5ZmMxMjE3ZmU2NzYxMmVmNjE4NWViMTk5ZmIwY2JkMTlhNWVmMDVhMmYwYWFiZDNiIiwiY2hhbGxlbmdlIjoiNmUwNDdmMTgzZGRkMjBhMzQ2YjkwMDQwYTdmMzJiMWViMzQyZGY0YzUxYmM0NDhjMjY3NTEwMWY5MDBlYWI5NSIsImNiVVJMIjoiaHR0cDovL2xvY2FsaG9zdDo5MDkwL2Fuc3dlci8ifQ',
  );

  const [severStarted, setServerStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [decodedUrl, setDecodedUrl] = useState<SlashtagsURL>();
  const [keyPair, setKeyPair] = useState<KeyPair>();
  const [authPayload, setAuthPayload] = useState<object>();

  useEffect(() => {
    return;

    if (severStarted) {
      return;
    }
    nodejs.start('main.js');

    setServerStarted(true);

    nodejs.channel.addListener('message', setMessage, null);
    nodejs.channel.addListener('decode-url', setDecodedUrl, null);
    nodejs.channel.addListener('key-pair', setKeyPair, null);
  }, [severStarted]);

  useEffect(() => {
    // Handle incoming action urls
    (async () => {
      if (!decodedUrl) {
        return;
      }

      try {
        const {actionID, payload} = decodedUrl!;

        switch (actionID) {
          case 'b2iaqaamaaqjcbw5htiftuksya3xkgxzzhrqwz4qtk6oxn7u74l23t2fthlnx3ked':
            setAuthPayload(payload);
            break;

          default:
            setAuthPayload(undefined);
            console.error('Unknown action');
            return;
        }
      } catch (error) {
        console.error('Invalid actionURL url');
      }
    })();
  }, [decodedUrl, actionURL]);

  return (
    <View>
      <TextInput
        style={{height: 20, width: '100%', backgroundColor: 'blue'}}
        value={actionURL}
        onChangeText={setActionURL}
      />

      <Button
        title="Decode URL"
        onPress={() => nodejs.channel.post('decode-url', actionURL)}
      />

      <Button
        title="Set user"
        onPress={() => nodejs.channel.post('key-pair', 'My first user')}
      />

      {/*<Button title={'decodeURL'} onPress={decodeURL} />*/}

      <Text>
        Server message: {JSON.stringify(message)}
        {'\n\n'}
      </Text>

      {/*<Text>URL: {JSON.stringify(decodedUrl)}</Text>*/}

      <Text>
        AUTH: {JSON.stringify(authPayload)}
        {'\n\n'}
      </Text>

      <Text>KEY PAIR: {JSON.stringify(keyPair)}</Text>
    </View>
  );
};

export default Wallet;
