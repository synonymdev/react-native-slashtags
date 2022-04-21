export const validateSetup = (params: any): void => {
	const { name, primaryKey, basicProfile, relays } = params;

	const missingParams = [];
	if (!name) {
		missingParams.push('name (string)');
	}

	if (!primaryKey) {
		missingParams.push('primaryKey (hex string / Uint8Array)');
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

	if (!relays || !Array.isArray(relays) || relays.length === 0) {
		missingParams.push('relays (array)');
	}

	if (missingParams.length > 0) {
		throw new Error(`Missing params: ${missingParams.join(', ')}`);
	}
};
