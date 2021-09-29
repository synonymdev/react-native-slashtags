import React, {useState, useEffect, useRef} from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {
  Initiator,
  KeyPair,
  Responder,
} from '@synonymdev/slashtags-auth/types/interfaces';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

import {SlashtagsURL} from '@synonymdev/slashtags-url/types/interfaces';

const SlashtagsWeb = () => {
  const [actionURL, setActionURL] = useState(
    'slashtags:b2iaqaamaaqjcbw5htiftuksya3xkgxzzhrqwz4qtk6oxn7u74l23t2fthlnx3ked/#ugAR7InJlbW90ZVBLIjoiMDNmYzg4OGFlOTMxNDExZmY5ZmMxMjE3ZmU2NzYxMmVmNjE4NWViMTk5ZmIwY2JkMTlhNWVmMDVhMmYwYWFiZDNiIiwiY2hhbGxlbmdlIjoiMTRhYWI0YTZmNTQ3NWJhY2RlY2M2OTY3YmU5YTlkOGJmMWIwYzQyNjM4YTI0OTBmMmQ5ZTlmZTQzNzNmNzM1ZCIsImNiVVJMIjoiaHR0cDovL2xvY2FsaG9zdDo5MDkwL2Fuc3dlci8ifQ',
  );

  const [severStarted, setServerStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [decodedUrl, setDecodedUrl] = useState<SlashtagsURL>();
  const [keyPair, setKeyPair] = useState<KeyPair>();
  const [authPayload, setAuthPayload] = useState<object>();

  let webViewRef = useRef(null);

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

  const callWebAction = (method: string, params: object) => {
    const javascript = `
            webAction('${method}', '${JSON.stringify(params)}');
            true;
          `;
    // @ts-ignore
    webViewRef.injectJavaScript(javascript);
  };

  const handleWebActionResponse = (event: WebViewMessageEvent) => {
    const {method, result, error} = JSON.parse(event.nativeEvent.data);

    if (error) {
      console.error(error);
      return;
    }

    switch (method) {
      case 'decode-url': {
        setDecodedUrl(result);
        break;
      }
      case 'create-key-pair': {
        setKeyPair(result);
        break;
      }
      case 'auth': {
        setMessage(result);
        break;
      }
      default: {
        alert(`Unknown method response (${method})`);
      }
    }
  };

  const username = 'My username';

  return (
    <View>
      <WebView
        ref={r => {
          // @ts-ignore
          webViewRef = r;
        }}
        source={{uri: 'http://localhost:3001/'}}
        onLoad={() => setMessage('Web app loaded')}
        onMessage={handleWebActionResponse}
      />
      <Text>Username: {username}</Text>

      <TextInput
        style={{height: 20, width: '100%', backgroundColor: 'green'}}
        value={actionURL}
        onChangeText={setActionURL}
      />
      <Button
        title="Decode URL"
        onPress={() => {
          callWebAction('decode-url', {actionURL});
        }}
      />
      <Button
        title="Set user"
        onPress={() => {
          callWebAction('create-key-pair', {seed: username});
        }}
      />
      <Button
        title="Auth"
        onPress={() => {
          if (!authPayload) {
            return alert('Set authPayload');
          }

          callWebAction('auth', {
            seed: username,
            metadata: {preferred_name: username},
            authPayload,
          });
        }}
      />

      <Text>
        Web message: {JSON.stringify(message)}
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

export default SlashtagsWeb;
