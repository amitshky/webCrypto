import { webcrypto } from 'node:crypto';
const crypto = webcrypto as unknown as Crypto;

(async () =>
{
	let plaintext: Buffer = Buffer.from('hello', 'utf-8');
	const rsaKey: CryptoKeyPair = await crypto.subtle.generateKey({ 
		name: 'RSA-OAEP', 
		modulusLength: 2048, 
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
		hash: { name: 'SHA-256' }
	}, true, ['encrypt', 'decrypt']);

	const rsaPrivateKey = Buffer.from(await crypto.subtle.exportKey('pkcs8', rsaKey.privateKey!)).toString('base64');
	const rsaPublicKey = Buffer.from(await crypto.subtle.exportKey('spki', rsaKey.publicKey!)).toString('base64');
	console.log('Private Key:', rsaPrivateKey, '\n');
	console.log('Public Key:', rsaPublicKey, '\n');

	const cipher = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaKey.publicKey!, plaintext);
	const ciphertext = Buffer.from(cipher);
	console.log('ciphertext:', ciphertext.toString('base64'), '\n');

	const plaintextBytes = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaKey.privateKey!, ciphertext);
	plaintext = Buffer.from(plaintextBytes);
	console.log('plaintext:', plaintext.toString('utf-8'));
})();