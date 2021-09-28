import nodejs from 'nodejs-mobile-react-native';

///import EventEmitter = from 'react-native/Libraries/vendor/emitter/EventEmitter';

import React, {useState, useEffect} from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {
  Initiator,
  KeyPair,
  Responder,
} from '@synonymdev/slashtags-auth/types/interfaces';

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
  const [decodedUrl, setDecodedUrl] = useState({});

  useEffect(() => {
    if (severStarted) {
      return;
    }
    nodejs.start('main.js');

    setServerStarted(true);

    nodejs.channel.addListener('message', setMessage, null);
    nodejs.channel.addListener('decode-url', setDecodedUrl, null);
  }, [severStarted]);

  return (
    <View>
      <Button title={'Start main.js'} onPress={() => {}} />

      <Button
        title="Decode URL"
        onPress={() => nodejs.channel.post('decode-url', actionURL)}
      />

      <TextInput
        style={{height: 20, width: '100%', backgroundColor: 'red'}}
        value={actionURL}
        onChangeText={setActionURL}
      />

      {/*<Button title={'decodeURL'} onPress={decodeURL} />*/}

      <Text>{message}</Text>

      <Text>URL: {JSON.stringify(decodedUrl)}</Text>
    </View>
  );
};

export default Wallet;
