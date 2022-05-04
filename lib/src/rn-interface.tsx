import React, { forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import webInterfaceHex from './web-interface';
import { hexToString, bytesToHexString } from './helpers';
import { validateSetProfile, validateSetup } from './validators';
import { View } from 'react-native';
import {
	THexKeyPair,
	TRnSlashtags,
	TOnApiReady,
	TSetProfileParams,
	TSetProfileResult,
	TSetupParams,
	TSlashUrlResult,
	TUrlParseResult,
	TSdkState
} from './index';

const html = hexToString(webInterfaceHex);

type TWebViewResolve = (res: string) => void;
type TWebViewReject = (e: Error) => void;

const webCallPromises: {
	[key: string]: { resolve: TWebViewResolve; reject: TWebViewReject; time: Date };
} = {};

type TWebMethod =
	| 'generateSeedKeyPair'
	| 'setupSDK'
	| 'setProfile'
	| 'parseUrl'
	| 'slashUrl'
	| 'state';

export default forwardRef(({ onApiReady }: { onApiReady?: TOnApiReady }, ref) => {
	const [webViewRef, setWebViewRef] = useState<WebView>();
	const [msgIdNonce, setMsgIdNonce] = useState(0);
	const [webReady, setWebReady] = useState(false);

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
		}
	};

	const callWebAction = useCallback(
		async (method: TWebMethod, params: any, timeout = 3000): Promise<any> => {
			if (!webReady) {
				throw new Error('Slashtags API not ready');
			}

			// Returned string in handleWebActionResponse will become the slashtags sdk response
			const javascript = `
		        webAction('${msgIdNonce}', '${method}', '${JSON.stringify(params)}'); void(0);
		      `;

			setMsgIdNonce(msgIdNonce + 1);

			if (!webViewRef) {
				throw Error('webViewRef not set');
			}

			webViewRef.injectJavaScript(javascript);

			// Cache the promise, it'll be resolved/rejected above when a response from the web app is received in handleWebActionResponse
			return await new Promise(function (resolve: TWebViewResolve, reject: TWebViewReject) {
				webCallPromises[msgIdNonce] = { resolve, reject, time: new Date() };

				// Timeout failsafe
				setTimeout(() => {
					if (webCallPromises[msgIdNonce]) {
						const errMsg = `Interface method call '${method}' timeout`;
						console.error(errMsg);
						webCallPromises[msgIdNonce].reject(new Error(errMsg));
					}
				}, timeout);
			});
		},
		[msgIdNonce, webReady, webViewRef]
	);

	const setServerStarted = (): void => {
		setWebReady(true);
		if (onApiReady) {
			onApiReady();
		}
	};

	const rnSlashtags: TRnSlashtags = {
		// TODO add each slashtags function here and types to TRnSlashtags
		async generateSeedKeyPair(seed: string): Promise<THexKeyPair> {
			return await callWebAction('generateSeedKeyPair', seed, 1000);
		},
		async setupSDK(params: TSetupParams): Promise<void> {
			validateSetup(params);
			if (typeof params.primaryKey !== 'string') {
				// Strings need to be passed
				params.primaryKey = bytesToHexString(params.primaryKey);
			}
			await callWebAction('setupSDK', params, 1000);
		},
		async setProfile(params: TSetProfileParams): Promise<TSetProfileResult> {
			validateSetProfile(params);
			return await callWebAction('setProfile', params, 1000);
		},
		async parseUrl(url: string): Promise<TUrlParseResult> {
			return await callWebAction('parseUrl', url, 500);
		},
		async slashUrl(url: string): Promise<TSlashUrlResult> {
			return await callWebAction('slashUrl', url, 10000);
		},
		async state(): Promise<TSdkState> {
			return await callWebAction('state', {}, 1000);
		}
	};

	useImperativeHandle(ref, () => rnSlashtags);

	return (
		<View style={{ width: 0, height: 0 }}>
			<WebView
				cacheMode={'LOAD_NO_CACHE'}
				ref={(r) => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-expect-error
					setWebViewRef(r);
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
});
