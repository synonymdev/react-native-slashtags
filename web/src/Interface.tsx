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
            case 'updateProfile': {
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

                onResult({name, isNew: !existing, slashtag: slashtag.url});

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
                const { profileName, url } = params;
                if (!url) {
                    onError(new Error("Missing url param"));
                    return;
                }

                const parsed = SDK.parseURL(url);

                //Profile we'll be using
                const slashtag = await sdk.slashtag({ name: profileName });
                const existing = await slashtag.getProfile();
                if (!existing) {
                    return onError(`No local profile found for ${profileName}`);
                }

                //Remote user/server
                const remote = sdk.slashtag({ url });
                await remote.ready();

                const profile = await remote.getProfile();
                if (!profile) {
                    return onError('No remote profile found');
                }

                switch (parsed.protocol) {
                    case 'slashauth':
                        const auth = slashtag.protocols.get('slashauth:alpha')

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
            }
            case 'state': {
                let info = {
                    sdkSetup: false,
                    profiles: 0,
                    relays: [],
                };

                if (sdk) {
                    info.sdkSetup = true;
                    info.profiles = sdk.slashtags.size;
                    info.relays = sdk.opts.relays;
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
    const [slashAuthUrl, setSlashAuthUrl] = useState('slashauth://xbbtqitn5gnwqcvot2aikg46g5lj2fa3mcug2hd6ngjzaktnpt6q?q=ij2c7zf9gu');

    const profileName = 'my-first-profile';

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
                window.webAction(Math.random(), 'updateProfile', JSON.stringify({
                    name: profileName,
                    basicProfile: {
                        name: 'RNInterfaceTest',
                        type: 'Person',
                    },
                }));
            }}>
                Update profile
            </button>

            <button onClick={() => {
                window.webAction(Math.random(), 'parseUrl', JSON.stringify(slashAuthUrl));
            }}>
                Parse URL
            </button>

            <button onClick={() => {
                window.webAction(Math.random(), 'slashUrl', JSON.stringify({profileName, url: slashAuthUrl}));
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
