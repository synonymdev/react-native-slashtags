import React, { useEffect, forwardRef, useRef, useImperativeHandle, useState } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { bytesToHexString, hexStringToBytes } from './helpers';

const webAppUrl = 'http://localhost:3000/';

type TWebViewResolve = (res: string) => void;
type TWebViewReject = (res: string) => void;

type TSlashtagsProps = {
	onApiReady: () => void;
};

const webCallPromises: {
	[key: string]: { resolve: TWebViewResolve; reject: TWebViewReject; time: Date };
} = {};

export default forwardRef(({ onApiReady }: TSlashtagsProps, ref) => {
	let webViewRef = useRef<WebView>();
	const [msgIdNonce, setMsgIdNonce] = useState(0);
	const [webReady, setWebReady] = useState(false);

	const handleWebActionResponse = (event: WebViewMessageEvent): void => {
		const { msgId, method, result, error } = JSON.parse(event.nativeEvent.data);

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

	// TODO don't just return strings
	const callWebAction = async (method: string, params: any, timeout = 3000): Promise<string> => {
		if (!webReady) {
			throw new Error('Slashtags API not ready');
		}

		// Returned string in handleWebActionResponse will become the slashtags sdk response
		const javascript = `
		        webAction('${msgIdNonce}', '${method}', '${JSON.stringify(params)}');
		        true;
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
		async didKeyFromPubKey(pubKey: Uint8Array) {
			return await callWebAction('didKeyFromPubKey', { pubKey: bytesToHexString(pubKey) }, 1000);
		},
		async selfTest() {
			return await callWebAction('selfTest', { test: 'Test' }, 1000);
		},
		async auth(
			url: string,
			onResponse: (serverProfile: any, additionalItems: any) => any,
			onSuccess: (connection: any, additionalItems: any) => void,
			onError: (error: Error) => void
		) {
			return await callWebAction('auth', { url }, 15000);
		}
	}));

	return (
		<WebView
			ref={(r) => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				webViewRef = r;
			}}
			source={{ uri: webAppUrl }}
			onLoad={setServerStarted}
			onMessage={handleWebActionResponse}
			onHttpError={console.error}
			onError={console.error}
		/>
	);
});
