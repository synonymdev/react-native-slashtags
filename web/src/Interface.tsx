import { SDK } from '@synonymdev/slashtags-sdk';
import { SlashAuth } from '@synonymdev/slashtags-auth';
import randomBytes from 'randombytes';
import { secp256k1 as curve } from 'noise-curve-tiny-secp';
import {useState} from 'react';

import {bytesKeyPairToStringKeyPair, hexStringToBytes, stringKeyPairToBytesKeyPair, bytesToHexString} from './helpers';

declare global {
    interface Window {
        webAction: any;
        ReactNativeWebView: any;
    }
}

declare global {
    var IDBMutableFile: any;
}

let currentProfile;
let sdk;

window.webAction = async (msgId: string, method: string, paramsString: string) => {
    const params = JSON.parse(paramsString);

    const onResult = (result: any) => {
        if (!window.ReactNativeWebView) {
            return console.info(result);
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({ msgId, method, result }));
    }

    const onError = (error: Error | string) => {
        if (!window.ReactNativeWebView) {
            return console.error(error);
        }

        if (typeof error === 'string') {
            error = new Error(error);
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({ msgId, method, error: error.message || error.toString() }));
    }

    try {
        switch (method) {
            case 'setupSDK': {
                const { relays } = params;
                const primaryKey = hexStringToBytes(params.primaryKey);

                const requestFileSystem = global.requestFileSystem || global.webkitRequestFileSystem;

                if (!requestFileSystem) {
                    console.warn("This browser doesn't supports the FileSystem API, storage will be in memory");
                }

                sdk = await SDK.init({
                    primaryKey,
                    relays,
                });

                onResult(true);

                break;
            }
            case 'setProfile': {
                if (!sdk) {
                    return onError('Requires sdkSetup()');
                }

                const { name, basicProfile } = params;

                const slashtag = await sdk.slashtag({ name });
                const existing = await slashtag.getProfile();

                slashtag.registerProtocol(SlashAuth)

                if (!existing) {
                    const profile = {
                        id: slashtag.url,
                        ...basicProfile
                    };

                    await slashtag.setProfile(profile);
                }

                currentProfile = slashtag;

                onResult({name, isNew: !existing, slashtag: currentProfile.url});

                break;
            }
            case 'parseUrl': {
                const url = params;

                if (!url) {
                    return onError('Missing url');
                }
                const res = SDK.parseURL(url);
                res.key = bytesToHexString(res.key);
                onResult(res);
                break;
            }
            case 'generateSeedKeyPair': {
                onResult(bytesKeyPairToStringKeyPair(curve.generateSeedKeyPair(params)));
                break;
            }
            case 'slashUrl': {
                if (!sdk) {
                    return onError('Requires sdkSetup()');
                }

                if (!currentProfile) {
                    return onError('Requires setProfile()');
                }

                const url = params;
                if (!url) {
                    onError(new Error("Missing url param"));
                    return;
                }

                const parsed = SDK.parseURL(url);

                const remote = sdk.slashtag({ url });
                await remote.ready();

                const profile = await remote.getProfile();
                if (!profile) {
                    return onError('No remote profile found');
                };

                switch (parsed.protocol) {
                    case 'slashauth':
                        const auth = currentProfile.protocols.get('slashauth:alpha')

                        auth.once('error', (error) => {
                            onResult({loginSuccess: false, loginError: error});
                        });

                        auth.once('success', () => {
                            onResult({loginSuccess: true});
                        });

                        auth.request(url)
                        return;
                    case 'slash':
                        return;
                    default:
                        return;
                }

                break;
            }
            case 'state': {
                let info = {
                    receivedMessage: params.message,
                    'global.indexedDB': '${global.indexedDB}',
                    sdk: 'Not initialized',
                    slashtags: 0,
                    relays: '',
                };

                if (sdk) {
                    info.sdk = 'Initialized';
                    info.slashtags = sdk.slashtags.size;
                    info.relays = sdk.opts.relays.toString();
                }

                onResult(info);
                break;
            }
            default: {
                console.warn("Actions error");
                onError(new Error(`Unknown method called in slashtags web wrapper: '${method}'`));
            }
        }
    } catch (e) {
        onError(e);
    }
};


function RNInterface() {
    const [slashAuthUrl, setSlashAuthUrl] = useState('')

    return (
        <div className="App">
            <pre>
                ReactNative Slashtags web wrapper. Nothing to see here.
            </pre>

            <input
                placeholder="login with slashtag"
                value={slashAuthUrl}
                onChange={(e) => setSlashAuthUrl(e.target.value)}
            />

            <button onClick={() => {
                window.webAction(Math.random(), 'setupSDK', JSON.stringify({
                    primaryKey: bytesToHexString(randomBytes(32)),
                    relays: ['ws://localhost:8888'],
                }));
            }}>
                Setup SDK
            </button>

            <button onClick={() => {
                window.webAction(Math.random(), 'setProfile', JSON.stringify({
                    name: 'my-first-profile',
                    basicProfile: {
                        name: 'RNInterfaceTest',
                        type: 'Person',
                    },
                }));
            }}>
                Set profile
            </button>

            <button onClick={() => {
                window.webAction(Math.random(), 'parseUrl', JSON.stringify({url: slashAuthUrl}));
            }}>
                Parse URL
            </button>

            <button onClick={() => {
                window.webAction(Math.random(), 'slashUrl', JSON.stringify({url: slashAuthUrl}));
            }}>
                Auth
            </button>

            <button onClick={() => {
                window.webAction(Math.random(), 'state', JSON.stringify({message: 'Web test'}));
            }}>
                State check
            </button>
        </div>
    );
}

export default RNInterface;
