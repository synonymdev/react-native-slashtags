import { SDK } from '@synonymdev/slashtags-sdk';
import randomBytes from 'randombytes';
import {useState} from 'react';

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

let user;
let sdk;

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
            case 'setup': {
                // TODO pass these as params from lib
                const name = 'todo';
                const primaryKey = randomBytes(32);
                const basicProfile = {
                    type: 'Person',
                    name: "Todo",
                };

                const requestFileSystem = global.requestFileSystem || global.webkitRequestFileSystem;

                if (!requestFileSystem) {
                    console.warn("This browser doesn't supports the FileSystem API, storage will be in memory");
                }

                console.log('sdk setup...');


                sdk = await SDK.init({
                    primaryKey,
                    relays,
                });

                const slashtag = await sdk.slashtag({ name });
                const existing = await slashtag.getProfile();

                console.log('Found existing profile', existing);

                if (!existing) {
                    const profile = {
                        id: slashtag.url,
                        ...basicProfile
                    };

                    await slashtag.setProfile(profile);
                }

                console.log('Created a slashtag', slashtag.url);

                user = slashtag;

                onResult({slashtag: user.url});

                break;
            }
            case 'parseUrl': {
                onResult(SDK.parseURL(params.url));
                break;
            }
            case 'generateSeedKeyPair': {
                onResult(bytesKeyPairToStringKeyPair(curve.generateSeedKeyPair(params.seed)));
                break;
            }
            case 'auth': {
                if (!user || !sdk) {
                    return onError(new Error("Requires setup"));
                }

                const {url} = params;
                if (!url) {
                    onError(new Error("Missing url param"));
                    return;
                }

                console.log(url);

                const parsed = SDK.parseURL(url);

                const remote = sdk.slashtag({ url });

                try {
                    await remote.ready();
                } catch (error) {
                    onError(error);
                    return;
                }

                const profile = await remote.getProfile();
                if (!profile) alert('No profile found');

                switch (parsed.protocol) {
                    case 'slashauth':
                        onResult({result: 'todo'});
                        return;
                    case 'slash':
                        return;
                    default:
                        return;
                }

                break;
            }
            case 'selfTest': {
                onResult(`global.IDBMutableFile: '${global.IDBMutableFile}' global.indexedDB: '${global.indexedDB}' time: ${new Date().toLocaleTimeString()} param: ${params.test}`)
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
    // window.webAction('9999999999', 'generateSeedKeyPair', '{"seed":"tester"}');

    const url = 'slashauth://vzzcuefywc6wkscdbwypcrrrz3o3375vkscxyk6srr2h6mkj762q?q=S+vFJJvNEk4=';

    return (
        <div className="App">
            <pre>
                ReactNative Slashtags web wrapper. Nothing to see here.
            </pre>
            {/*<p>{`global.IDBMutableFile: '${global.IDBMutableFile}' global.indexedDB: '${global.indexedDB}'`}</p>*/}
            {/*<button onClick={() => {*/}
            {/*    window.webAction('999999999', 'auth', '{"url":"slash://bq4aqaoqnddp57smqicd6ob3ntfrim6zhvjd5ji7v3aejoy423yhkutuh?act=1&tkt=zhzd7pWQuVTq"}');*/}
            {/*}}>*/}
            {/*    Test auth*/}
            {/*</button>*/}

            <button onClick={() => {
                window.webAction('9999999999', 'setup', JSON.stringify({}));
            }}>
                Setup
            </button>

            <button onClick={() => {
                window.webAction('9999999999', 'auth', JSON.stringify({url}));
            }}>
                Auth
            </button>

            <button onClick={() => {
                window.webAction('9999999998', 'selfTest', JSON.stringify({test: 'Tested'}));
            }}>
                Self Test
            </button>
        </div>
    );
}

export default RNInterface;
