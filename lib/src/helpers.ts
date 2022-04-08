/**
 * Converts bytes to hex string
 * @param bytes
 * @returns {string}
 */
export const bytesToHexString = (bytes: Uint8Array): string => {
	return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

/**
 * Converts hex string to bytes
 * @param hexString
 * @returns {Uint8Array}
 */
export const hexStringToBytes = (hexString: string): Uint8Array => {
	const bytes = hexString.match(/.{1,2}/g);
	if (!bytes) {
		return new Uint8Array(0);
	}

	return new Uint8Array(bytes.map((byte) => parseInt(byte, 16)));
};

export const hexToString = (str1: string): string => {
	const hex = str1.toString();
	let str = '';
	for (let n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
};
