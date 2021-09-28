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

import {createAuth} from '@synonymdev/slashtags-auth';
import {secp256k1 as curve} from 'noise-curve-tiny-secp';
import * as SlashtagsURL from '@synonymdev/slashtags-url';
import bint from 'bint8array';
import crypto from 'crypto';
import sodium from 'react-native-libsodium';

// import {Initiator, KeyPair, Responder} from '@synonymdev/slashtags-auth/types/interfaces';

/** @type {string} */
let username;
let userKeyPair: KeyPair;
let initiator: Initiator;

/**
 * @param {string} seed
 */
export const setUser = (seed: string) => {
  username = seed;
  userKeyPair = curve.generateSeedKeyPair(seed);

  const {initiator: init} = createAuth(userKeyPair, {
    metadata: {preferred_name: username},
  });

  initiator = init;
};

const Wallet = () => {
  const [actionURL, setActionURL] = useState(
    'slashtags:b2iaqaamaaqjcbw5htiftuksya3xkgxzzhrqwz4qtk6oxn7u74l23t2fthlnx3ked/#ugAR7InJlbW90ZVBLIjoiMDNmYzg4OGFlOTMxNDExZmY5ZmMxMjE3ZmU2NzYxMmVmNjE4NWViMTk5ZmIwY2JkMTlhNWVmMDVhMmYwYWFiZDNiIiwiY2hhbGxlbmdlIjoiNmUwNDdmMTgzZGRkMjBhMzQ2YjkwMDQwYTdmMzJiMWViMzQyZGY0YzUxYmM0NDhjMjY3NTEwMWY5MDBlYWI5NSIsImNiVVJMIjoiaHR0cDovL2xvY2FsaG9zdDo5MDkwL2Fuc3dlci8ifQ',
  );
  const [authPayload, setAuthPayload] = useState();
  const [server, setServer] = useState(false);
  const [account, setAccount] = useState(false);

  const signIn = async () => {
    const {attestation, verifyResponder} = initiator.signChallenge(
      bint.fromString(authPayload.remotePK, 'hex'),
      bint.fromString(authPayload.challenge, 'hex'),
    );

    const url = new URL(authPayload.cbURL);
    url.searchParams.set(
      'attestation',
      Buffer.from(attestation).toString('hex'),
    );
    const res = await fetch(url.toString());
    const {responderAttestation} = await res.json();

    const {responderPK, metadata} = verifyResponder(
      Buffer.from(responderAttestation, 'hex'),
    );

    setAuthPayload(null);
    setServer({
      verified: true,
      metadata,
      responderPK: Buffer.from(responderPK).toString('hex'),
    });
  };

  const decodeURL = () => {
    (async () => {
      if (!actionURL) {
        return;
      }

      try {
        const {actionID, payload} = SlashtagsURL.parse(actionURL);

        switch (actionID) {
          case 'b2iaqaamaaqjcbw5htiftuksya3xkgxzzhrqwz4qtk6oxn7u74l23t2fthlnx3ked':
            setAuthPayload(payload);
            break;

          default:
            setAuthPayload(null);
            return;
        }
      } catch (error) {
        alert('Invalid actionURL url');
      }
    })();
  };

  return (
    <View>
      <TextInput
        style={{height: 20, width: '100%', backgroundColor: 'red'}}
        value={actionURL}
        onChangeText={setActionURL}
      />

      <Button title={'decodeURL'} onPress={decodeURL} />

      {/*<Text>{message}</Text>*/}
    </View>
  );
};

export default Wallet;
