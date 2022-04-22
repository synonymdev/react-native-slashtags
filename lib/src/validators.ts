import { TSetProfileParams, TSetupParams } from './index';

export const validateSetup = (params: TSetupParams): void => {
	const { primaryKey, relays } = params;

	const missingParams = [];

	if (!primaryKey) {
		missingParams.push('primaryKey (hex string / Uint8Array)');
	}

	if (!relays || !Array.isArray(relays) || relays.length === 0) {
		missingParams.push('relays (array)');
	}

	if (missingParams.length > 0) {
		throw new Error(`Missing params: ${missingParams.join(', ')}`);
	}
};

export const validateSetProfile = (params: TSetProfileParams): void => {
	const { name, basicProfile } = params;

	const missingParams = [];
	if (!name) {
		missingParams.push('name (string)');
	}

	if (!basicProfile) {
		missingParams.push('basicProfile (object)');
	} else {
		if (!basicProfile.type) {
			missingParams.push('basicProfile.type (string)');
		}

		if (!basicProfile.name) {
			missingParams.push('basicProfile.name (string)');
		}
	}

	if (missingParams.length > 0) {
		throw new Error(`Missing params: ${missingParams.join(', ')}`);
	}
};
