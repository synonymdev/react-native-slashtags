import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import webInterfaceHex from './web-interface';
import { hexToString } from './helpers';

const html = hexToString(webInterfaceHex);

type TWebViewResolve = (res: string) => void;
type TWebViewReject = (res: string) => void;

type TSlashtagsProps = {
	onApiReady: () => void;
};

const webCallPromises: {
	[key: string]: { resolve: TWebViewResolve; reject: TWebViewReject; time: Date };
} = {};

export type THexKeyPair = { publicKey: string; secretKey: string };

export default forwardRef(({ onApiReady }: TSlashtagsProps, ref) => {
	let webViewRef = useRef<WebView>();
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

			// TODO release webCallPromises index from memory

			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			// delete webCallPromises[msgId];
		}
	};

	const callWebAction = async (method: string, params: any, timeout = 3000): Promise<any> => {
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

		// @ts-expect-error it does exist
		webViewRef.injectJavaScript(javascript);

		// Cache the promise, it'll be resolved/rejected above when a response from the web app is received in handleWebActionResponse
		return await new Promise(function (resolve: TWebViewResolve, reject: TWebViewReject) {
			webCallPromises[msgIdNonce] = { resolve, reject, time: new Date() };

			// TODO add a timeout and reject the promise if it still exists after timeout
		});
	};

	const setServerStarted = (): void => {
		setWebReady(true);
		onApiReady();
	};

	useImperativeHandle(ref, () => ({
		// TODO this will become each slashtags function
		async generateSeedKeyPair(seed: string): Promise<THexKeyPair> {
			return await callWebAction('generateSeedKeyPair', { seed }, 1000);
		},
		async didKeyFromPubKey(pubKey: string): Promise<string> {
			return await callWebAction('didKeyFromPubKey', { pubKey }, 1000);
		},
		async auth(
			url: string,
			keyPair: THexKeyPair,
			profile: any
		): Promise<{ connection: any; additionalItems: any[] }> {
			return await callWebAction('auth', { url, keyPair, profile }, 15000);
		},
		async selfTest(): Promise<string> {
			return await callWebAction('selfTest', { test: 'Test' }, 1000);
		}
	}));

	return (
		<WebView
			cacheMode={'LOAD_NO_CACHE'}
			ref={(r) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				webViewRef = r;
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
	);
});
