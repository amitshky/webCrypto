import crypto from 'node:crypto';

const encryptString = (plainText: string, key: string): string =>
{
	const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
	const ciphertext: string = Buffer.concat([cipher.update(plainText), cipher.final()]).toString('base64');

	return ciphertext;
}

const decryptString = (cipherText: string, key: string): string =>
{
	const cipherByte: Buffer = Buffer.from(cipherText, 'base64');
	const cipher = crypto.createDecipheriv('aes-128-ecb', key, null);
	const plaintext = Buffer.concat([cipher.update(cipherByte), cipher.final()]).toString('utf-8');

	return plaintext;
}


const encryptFile = (plainText: string, key: string): Buffer =>
{
	const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
	const cipherBuffer = Buffer.concat([cipher.update(plainText), cipher.final()]);

	return cipherBuffer;
}

const decryptFile = (cipherBuffer: Buffer, key: string): string =>
{
	const cipher = crypto.createDecipheriv('aes-128-ecb', key, null);
	return Buffer.concat([cipher.update(cipherBuffer), cipher.final()]).toString('utf-8');
}

(() =>
{
	const key = 'C51GH00SE8499727'; // key length: 128bits (16bytes)
	const encrypted = encryptFile('hello', key);
	const decrypted = decryptFile(encrypted, key);
	console.log('encrypted buffer: ', encrypted);
	console.log('decrypted string: ', decrypted);
})();