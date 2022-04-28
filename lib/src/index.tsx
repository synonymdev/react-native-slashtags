import React, {
	forwardRef,
	useRef,
	useImperativeHandle,
	useState,
	ReactElement,
	useEffect,
	useCallback
} from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import webInterfaceHex from './web-interface';
import { hexToString, bytesToHexString } from './helpers';
import { validateSetProfile, validateSetup } from './validators';
import { View } from 'react-native';

const html = hexToString(webInterfaceHex);

type TWebViewResolve = (res: string) => void;
type TWebViewReject = (res: string) => void;

const webCallPromises: {
	[key: string]: { resolve: TWebViewResolve; reject: TWebViewReject; time: Date };
} = {};

export type THexKeyPair = { publicKey: string; secretKey: string };
export type TKeyPairResult = { seed: string; keyPair: THexKeyPair };

export type TUrlParseResult = { protocol: string; key: string; query: any };
export type TBasicProfile = { type: string; name: string };
export type TSetupParams = {
	primaryKey: Uint8Array | string;
	relays: string[];
};
export type TSetProfileParams = {
	name: string;
	basicProfile: TBasicProfile;
};
export type TSetProfileResult = { slashtag: string };
export type TSlashUrlResult = { loginSuccess: boolean; loginError?: Error };

type TWebMethod =
	| 'generateSeedKeyPair'
	| 'setupSDK'
	| 'setProfile'
	| 'parseUrl'
	| 'slashUrl'
	| 'state';

type TSlashtagsProps = {
	onApiReady?: () => void;
	seed?: string;
	onKeyPair: (res: TKeyPairResult) => void;
	onKeyPairError: (e: Error) => void;
	setup: TSetupParams;
	onSetup: (res: boolean) => void;
	// TODO join keys, setup, profile and responses?
	onSetupError: (e: Error) => void;
};

let msgIdNonce = 0;
let webReady = false;

const propCache: { [key: string]: string } = {};
const isNew = (method: TWebMethod, params: any): boolean => {
	const newProps = JSON.stringify(params);
	const cachedProps = propCache[method];

	return cachedProps !== newProps; // TODO make use a hash so we don't keep all this data in memory
};
const setParams = (method: TWebMethod, params: any): void => {
	propCache[method] = JSON.stringify(params);
};

export default ({
	onApiReady,
	seed,
	onKeyPair,
	onKeyPairError,
	setup,
	onSetup,
	onSetupError
}: TSlashtagsProps): ReactElement => {
	// let webViewRef = useRef<WebView>();

	// eslint-disable-next-line no-null/no-null
	const [webViewRef, setRef] = useState(null);

	const handleWebActionResponse = (event: WebViewMessageEvent): void => {
		const { msgId, result, error } = JSON.parse(event.nativeEvent.data);

		const cachedPromise = webCallPromises[msgId];
		if (cachedPromise) {
			if (error) {
				console.error(error);
				cachedPromise.reject(error);
			} else {
				cachedPromise.resolve(result);
			}

			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete webCallPromises[msgId];
		} else {
			console.log(`Unknown msgId web result ${event.nativeEvent.data}`);
		}
	};

	const callWebAction = useCallback(
		async (
			method: TWebMethod,
			validationCheck: (params: any) => void,
			prepParams: (params: any) => any,
			params: any,
			timeout = 3000
		): Promise<any> => {
			// Do nothing on duplicate or missing params //TODO make work
			if (!params || !isNew(method, params)) {
				return;
			}

			if (!webReady) {
				throw new Error('Slashtags API not ready');
			}

			console.log(`Validating ${method}...`);

			// Cache so we don't re process
			setParams(method, params);

			// Should throw if there are errors
			validationCheck(params);

			const formattedParams = prepParams(params);

			console.log(`Processing ${method}...`);

			msgIdNonce += 1;

			// Returned string in handleWebActionResponse will become the slashtags sdk response
			const javascript = `
		        webAction('${msgIdNonce}', '${method}', '${JSON.stringify(formattedParams)}'); void(0);
		      `;

			if (!webViewRef) {
				throw new Error('webViewRef not set');
			}

			// @ts-expect-error it does exist
			webViewRef.injectJavaScript(javascript);

			// Cache the promise, it'll be resolved/rejected above when a response from the web app is received in handleWebActionResponse
			return await new Promise(function (resolve: TWebViewResolve, reject: TWebViewReject) {
				webCallPromises[msgIdNonce] = { resolve, reject, time: new Date() };

				// Timeout failsafe
				setTimeout(() => {
					if (webCallPromises[msgIdNonce]) {
						const errMsg = `Interface method call '${method}' timeout`;
						console.error(errMsg);
						webCallPromises[msgIdNonce].reject(errMsg);
					}
				}, timeout);
			});
		},
		[webViewRef]
	);

	const setServerStarted = (): void => {
		webReady = true;
		onApiReady?.();
	};

	useEffect(() => {
		callWebAction(
			'generateSeedKeyPair',
			() => {},
			(params) => params,
			seed,
			1000
		)
			.then((keyPair) => keyPair && onKeyPair({ seed: seed ?? '', keyPair }))
			.catch(onKeyPairError);
	}, [seed, onKeyPair, onKeyPairError, callWebAction]);

	useEffect(() => {
		const format = (params: TSetupParams): TSetupParams => {
			if (typeof params.primaryKey !== 'string') {
				// Strings need to be passed
				params.primaryKey = bytesToHexString(params.primaryKey);
			}

			return params;
		};

		callWebAction('setupSDK', validateSetup, format, setup, 1000)
			.then((res) => res && onSetup(res))
			.catch(onSetupError); // TODO move error handling to callWebAction
	}, [setup, onSetup, onSetupError, callWebAction]);

	// useImperativeHandle(ref, () => ({
	// 	// TODO add each slashtags function here
	// 	async generateSeedKeyPair(seed: string): Promise<THexKeyPair> {
	// 		return await callWebAction('generateSeedKeyPair', { seed }, 1000);
	// 	},
	// 	async setupSDK(params: TSetupParams): Promise<void> {
	// 		validateSetup(params);
	// 		if (typeof params.primaryKey !== 'string') {
	// 			// Strings need to be passed
	// 			params.primaryKey = bytesToHexString(params.primaryKey);
	// 		}
	// 		await callWebAction('setupSDK', params, 1000);
	// 	},
	// 	async setProfile(params: TSetProfileParams): Promise<TSetProfileResult> {
	// 		validateSetProfile(params);
	// 		return await callWebAction('setProfile', params, 1000);
	// 	},
	// 	async parseUrl(url: string): Promise<TUrlParseResult> {
	// 		return await callWebAction('parseUrl', { url }, 500);
	// 	},
	// 	async slashUrl(url: string): Promise<TSlashUrlResult> {
	// 		return await callWebAction('slashUrl', { url }, 10000);
	// 	},
	// 	async state(message: string): Promise<any> {
	// 		return await callWebAction('state', { message }, 1000);
	// 	}
	// }));

	return (
		<View style={{ width: 0, height: 0 }}>
			<WebView
				cacheMode={'LOAD_NO_CACHE'}
				ref={(r) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					setRef(r);
				}}
				source={{ html }}
				onLoad={setServerStarted}
				onMessage={handleWebActionResponse}
				onHttpError={console.error}
				onError={(e) => {
					console.warn('Web view error:');
					console.warn(console.error);
				}}
			/>
		</View>
	);
};
