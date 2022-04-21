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
            case 'setup': {
                // TODO maybe relays can be cached or separate setup method for SDK and profile details
                const { name, basicProfile, relays } = params;
                const primaryKey = hexStringToBytes(params.primaryKey);

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

                slashtag.registerProtocol(SlashAuth)

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
                // TODO validation

                const res = SDK.parseURL(params.url);
                res.key = bytesToHexString(res.key);
                onResult(res);
                break;
            }
            case 'generateSeedKeyPair': {
                // TODO validation

                onResult(bytesKeyPairToStringKeyPair(curve.generateSeedKeyPair(params.seed)));
                break;
            }
            case 'slashUrl': {
                // TODO validation

                if (!user || !sdk) {
                    return onError(new Error("Requires setup"));
                }

                const {url} = params;
                if (!url) {
                    onError(new Error("Missing url param"));
                    return;
                }

                const parsed = SDK.parseURL(url);

                const remote = sdk.slashtag({ url });
                await remote.ready()

                const profile = await remote.getProfile();
                if (!profile) alert('No profile found');

                console.log('Found remote profile', profile);

                switch (parsed.protocol) {
                    case 'slashauth':
                        const auth = user.protocols.get('slashauth:alpha')

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
            case 'selfTest': {
                onResult(`global.IDBMutableFile: '${global.IDBMutableFile}' global.indexedDB: '${global.indexedDB}' time: ${new Date().toLocaleTimeString()} param: ${params.test}`)
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
                window.webAction('9999999999', 'setup', JSON.stringify({}));
            }}>
                Setup
            </button>

            <button onClick={() => {
                window.webAction('9999999999', 'parseUrl', JSON.stringify({url: slashAuthUrl}));
            }}>
                Parse URL
            </button>

            <button onClick={() => {
                window.webAction('9999999999', 'slashUrl', JSON.stringify({url: slashAuthUrl}));
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
