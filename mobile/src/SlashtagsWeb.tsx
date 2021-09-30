import React, {useState, useEffect, useRef} from 'react';
import {Button, Text, TextInput, View, StyleSheet, Alert} from 'react-native';
import {
  Initiator,
  KeyPair,
  Responder,
} from '@synonymdev/slashtags-auth/types/interfaces';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

import {SlashtagsURL} from '@synonymdev/slashtags-url/types/interfaces';
import Scanner from './Scanner';

const SlashtagsWeb = () => {
  const [actionURL, setActionURL] = useState('');

  const [severStarted, setServerStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('Alice');
  const [decodedUrl, setDecodedUrl] = useState<SlashtagsURL>();
  const [keyPair, setKeyPair] = useState<KeyPair>();
  const [authPayload, setAuthPayload] = useState<object>();
  const [account, setAccount] = useState<object>();

  let webViewRef = useRef(null);
  const callWebAction = (method: string, params: object) => {
    const javascript = `
            webAction('${method}', '${JSON.stringify(params)}');
            true;
          `;
    // @ts-ignore
    webViewRef.injectJavaScript(javascript);
  };

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
            // setAuthPayload(payload);

            Alert.alert('Sign in', `Challenge: ${payload.challenge}`, [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'Sign in',
                onPress: () => {
                  callWebAction('auth', {
                    seed: username,
                    metadata: {preferred_name: username},
                    authPayload: payload,
                  });

                  setDecodedUrl(undefined);
                  setAuthPayload(undefined);

                  // alert(
                  //   JSON.stringify({
                  //     seed: username,
                  //     metadata: {preferred_name: username},
                  //     authPayload: payload,
                  //   }),
                  // );
                },
              },
            ]);

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
  }, [decodedUrl, actionURL, callWebAction]);

  useEffect(() => {
    if (!severStarted) {
      return;
    }

    callWebAction('create-key-pair', {seed: username});
  }, [severStarted, username]);

  useEffect(() => {
    if (!severStarted || !actionURL || actionURL.indexOf('slashtags:') < 0) {
      return;
    }

    callWebAction('decode-url', {actionURL});
  }, [severStarted, actionURL]);

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
        setAccount(result);
        setActionURL('');
        setAuthPayload(undefined);
        break;
      }
      default: {
        console.error(`Unknown method response (${method})`);
      }
    }
  };

  return (
    <View>
      <WebView
        ref={r => {
          // @ts-ignore
          webViewRef = r;
        }}
        source={{uri: 'http://192.168.1.139:3001/'}}
        onLoad={() => setServerStarted(true)}
        onMessage={handleWebActionResponse}
      />

      <View style={{width: '100%', height: 250}}>
        <Scanner onRead={setActionURL} />
      </View>

      <Text style={styles.text}>Username</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.text}>URL</Text>

      <TextInput
        style={styles.input}
        value={actionURL}
        onChangeText={setActionURL}
      />
      {/*<Button*/}
      {/*  title="Decode URL"*/}
      {/*  onPress={() => {*/}
      {/*    callWebAction('decode-url', {actionURL});*/}
      {/*  }}*/}
      {/*/>*/}

      <Text style={styles.text}>
        KEY PAIR: {JSON.stringify(keyPair)}
        {'\n\n'}
      </Text>

      {authPayload ? (
        <>
          <Text style={styles.text}>
            AUTH: {JSON.stringify(authPayload)}
            {'\n'}
          </Text>
          {/*<Button*/}
          {/*  title="Auth"*/}
          {/*  onPress={() => {*/}
          {/*    if (!authPayload) {*/}
          {/*      return alert('Set authPayload');*/}
          {/*    }*/}

          {/*    callWebAction('auth', {*/}
          {/*      seed: username,*/}
          {/*      metadata: {preferred_name: username},*/}
          {/*      authPayload,*/}
          {/*    });*/}
          {/*  }}*/}
          {/*/>*/}
        </>
      ) : null}

      {account ? (
        <View style={styles.account}>
          <Text style={styles.text}>
            Verified: {account.verified ? '✅' : '❌'}
            {'\n'}
          </Text>

          <Text style={styles.text}>
            Pubkey:{'\n'}
            {account.responderPK}
            {'\n'}
          </Text>

          <Text style={styles.text}>
            Metadata:{'\n'}
            {JSON.stringify(account.metadata)}
            {'\n'}
          </Text>

          {/*<Text style={styles.text}>*/}
          {/*  {'\n'}*/}
          {/*  {'\n'}*/}
          {/*  Account:*/}
          {/*  {JSON.stringify(account)}*/}
          {/*  {'\n\n'}*/}
          {/*</Text>*/}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'green',
  },
  input: {
    backgroundColor: 'green',
    marginBottom: 10,
  },
  account: {
    borderStyle: 'solid',
    borderColor: 'green',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
});

export default SlashtagsWeb;
