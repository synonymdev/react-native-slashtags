import React, { createContext, useContext, useRef } from 'react';
import RNInterface from './rn-interface';

export type THexKeyPair = { publicKey: string; secretKey: string };
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
export type TSetProfileResult = {
	name: string;
	isNew: boolean;
	slashtag: string;
};
export type TSlashUrlResult = { loginSuccess: boolean; loginError?: Error };
export type TSdkState = {
	sdkSetup: boolean;
	profiles: number;
	relays: string;
};
export type TOnApiReady = () => void;

export type TRnSlashtags = {
	generateSeedKeyPair: (seed: string) => Promise<THexKeyPair>;
	setupSDK: (params: TSetupParams) => Promise<void>;
	setProfile: (params: TSetProfileParams) => Promise<TSetProfileResult>;
	parseUrl: (url: string) => Promise<TUrlParseResult>;
	slashUrl: (url: string) => Promise<TSlashUrlResult>;
	state: () => Promise<TSdkState>;
};

export const SlashtagsContext = createContext<{ current: TRnSlashtags | undefined }>({
	current: undefined
});

const SlashtagsContextStore = (props: any): JSX.Element => {
	const ref = useRef();
	return <SlashtagsContext.Provider value={ref} {...props} />;
};

const SlashtagsInterface = ({ onApiReady }: { onApiReady?: TOnApiReady }): JSX.Element => {
	const slashtagsRef = useContext(SlashtagsContext);
	return <RNInterface onApiReady={onApiReady} ref={slashtagsRef} />;
};

export const SlashtagsProvider = ({
	children,
	onApiReady
}: {
	children: any;
	onApiReady?: TOnApiReady;
}): JSX.Element => {
	return (
		<SlashtagsContextStore>
			<SlashtagsInterface onApiReady={onApiReady} />
			{children}
		</SlashtagsContextStore>
	);
};

export default SlashtagsProvider;
