import { didKeyFromPubKey } from '@synonymdev/slashtags-auth';
import { Core } from '@synonymdev/slashtags-core';
import { ACT1_InitialResponseResult, Actions } from '@synonymdev/slashtags-actions';

import {bytesToHexString, hexStringToBytes} from './helpers';
import {Buffer} from 'buffer';
import { secp256k1 as curve } from 'noise-curve-tiny-secp';

import crypto from "crypto-js";

declare global {
    interface Window {
        webAction: any;
        ReactNativeWebView: any;
    }
}

declare global {
    var IDBMutableFile: any;
}

const testWebProfile = {
    '@id': null,
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Test web view profile',
    image: 'https://www.example.com/logo.png',
};

const relays = ['ws://localhost:8888'];

window.webAction = async (msgId: string, method: string, paramsString: string) => {
    const params = JSON.parse(paramsString);

    const onResult = (result: any) => {
        if (!window.ReactNativeWebView) {
            return console.info(result);
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ msgId, method, result }));
    }

    const onError = (error: any) => {
        if (!window.ReactNativeWebView) {
            return console.error(error);
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ msgId, method, error: error.message || error.toString() }));
    }

    try {
        switch (method) {
            case 'didKeyFromPubKey': {
                onResult(didKeyFromPubKey(hexStringToBytes(params.pubKey)));
                break;
            }
            case 'auth': {
                const {url} = params;
                const node = await Core({ relays });
                const actions = Actions(node);

                //Keypair must be a buffer
                const keyPair = {
                    publicKey: Buffer.from('0xc2cdf0a8b0a83b35ace53f097b5e6e6a0a1f2d40535eff1cf434f52a43d59d8f', 'hex'),
                    secretKey: Buffer.from('0x6fcc37ea5e9e09fec6c83e5fbd7a745e3eee81d16ebd861c9e66f55518c19798', 'hex')
                }

                // const keyPair = curve.generateSeedKeyPair("TODO");

                const id = didKeyFromPubKey(keyPair.publicKey);

                const persona = {
                    profile: {
                        '@context': 'https://schema.org',
                        '@type': 'Person',
                        '@id': id,
                    },
                    keyPair,
                };

                let retrievedBackup: Uint8Array | undefined = undefined;

                console.log("actions.handle");
                console.log(url);
                console.log(keyPair);

                await actions.handle(
                    url,
                    {
                        ACT1: {
                            onResponse: (
                                serverProfile, // Responder's profile
                                additionalItems, // Optional additionalItems from the authenticated Responder
                            ) => {
                                onResult("actions.handle onResponse!");
                                console.log("actions.handle onResponse!");

                                return {
                                    initiator: persona,
                                };
                            },
                            onSuccess: (connection, additionalItems) => {
                                console.log('Success');

                                onResult("actions.handle onSuccess!");

                                // TODO use additional items to set encryption key
                            },
                        },
                    },
                    (error) => {
                        // onError(error);
                        console.error(error);
                        onResult(error.message || error.code);
                    },
                );

                break;
            }
            case 'selfTest': {
                onResult(`global.IDBMutableFile: '${global.IDBMutableFile}' global.indexedDB: '${global.indexedDB}'`)
                // onResult(`Good to go ${new Date().toLocaleTimeString()}`);
                break;
            }
            default: {
                console.warn("Actions error");
                onError(new Error(`Unknown method called in slashtags web wrapper ${method}`));
            }
        }
    } catch (e) {
        onError(e);
    }
};


function App() {
  return (
    <div className="App">
      ReactNative Slashtags web wrapper. Nothing to see here.
        {/*<p>{`global.IDBMutableFile: '${global.IDBMutableFile}' global.indexedDB: '${global.indexedDB}'`}</p>*/}
        <button onClick={() => {
            window.webAction('999999999', 'auth', '{"url":"slash://bq4aqaoqnddp57smqicd6ob3ntfrim6zhvjd5ji7v3aejoy423yhkutuh?act=1&tkt=zQTUR6VJTMwg"}');
        }}>Test</button>
    </div>
  );
}

export default App;
