import { didKeyFromPubKey } from '@synonymdev/slashtags-auth';
import { Core } from '@synonymdev/slashtags-core';
import { Actions } from '@synonymdev/slashtags-actions';

import {bytesKeyPairToStringKeyPair, hexStringToBytes, stringKeyPairToBytesKeyPair} from './helpers';
import { secp256k1 as curve } from 'noise-curve-tiny-secp';

declare global {
    interface Window {
        webAction: any;
        ReactNativeWebView: any;
    }
}

declare global {
    var IDBMutableFile: any;
}

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
            case 'generateSeedKeyPair': {
                onResult(bytesKeyPairToStringKeyPair(curve.generateSeedKeyPair(params.seed)));
                break;
            }
            case 'auth': {
                const {url, profile} = params;
                const keyPair = stringKeyPairToBytesKeyPair(params.keyPair);

                const node = await Core({ relays });
                const actions = Actions(node);

                const persona = {
                    profile,
                    keyPair,
                };

                await actions.handle(
                    url,
                    {
                        ACT1: {
                            onResponse: (
                                serverProfile, // Responder's profile
                                additionalItems, // Optional additionalItems from the authenticated Responder
                            ) => {
                                return {
                                    initiator: persona,
                                };
                            },
                            onSuccess: (connection, additionalItems) => {
                                onResult({connection, additionalItems});
                            },
                        },
                    },
                    (error) => {
                        console.error(error);
                        onError(`actions.handle error. ${error.message || error.code}`);
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


function RNInterface() {
    return (
        <div className="App">
            ReactNative Slashtags web wrapper. Nothing to see here.
            {/*<p>{`global.IDBMutableFile: '${global.IDBMutableFile}' global.indexedDB: '${global.indexedDB}'`}</p>*/}
            {/*<button onClick={() => {*/}
            {/*    window.webAction('999999999', 'auth', '{"url":"slash://bq4aqaoqnddp57smqicd6ob3ntfrim6zhvjd5ji7v3aejoy423yhkutuh?act=1&tkt=zhzd7pWQuVTq"}');*/}
            {/*}}>*/}
            {/*    Test auth*/}
            {/*</button>*/}

            {/*<button onClick={() => {*/}
            {/*    window.webAction('9999999999', 'generateSeedKeyPair', '{"seed":"test"}');*/}
            {/*}}>*/}
            {/*    Test keypair*/}
            {/*</button>*/}
        </div>
    );
}

export default RNInterface;
