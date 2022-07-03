const encryptCryptoJS = (data: string, secretKey: string) => {
	const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
	return encrypted;
};
const decryptCryptoJS = (data: string, secretKey: string) => {
	const decrypted = CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
	return decrypted;
};
