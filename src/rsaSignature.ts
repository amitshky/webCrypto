import { webcrypto } from 'node:crypto';
const crypto = webcrypto as unknown as Crypto;

(async () =>
{
	let plaintext: Buffer = Buffer.from('hello', 'utf-8');
	console.log('plaintext:', plaintext.toString('utf-8'), '\n');
	
	const rsaKey: CryptoKeyPair = await crypto.subtle.generateKey({ 
		name: 'RSASSA-PKCS1-v1_5',
		modulusLength: 2048, // The length in bits of the RSA modulus. This should be at least 2048
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // The public exponent. Unless you have a good reason to use something else, specify 65537 here ([0x01, 0x00, 0x01])
		hash: { name: 'SHA-256' }
	}, true, ['sign', 'verify']);

	const rsaPrivateKey: string = Buffer.from(await crypto.subtle.exportKey('pkcs8', rsaKey.privateKey!)).toString('base64');
	const rsaPublicKey: string  = Buffer.from(await crypto.subtle.exportKey('spki', rsaKey.publicKey!)).toString('base64');
	console.log('Private key:', rsaPrivateKey, '\n');
	console.log('Public key:', rsaPublicKey, '\n');

	// sign plaintext
	const signature: ArrayBuffer = await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, rsaKey.privateKey!, plaintext);
	console.log('Signature:', Buffer.from(signature).toString('base64'), '\n');

	// verify plaintext
	const isVerified: boolean = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, rsaKey.publicKey!, signature, plaintext);
	console.log('verified:', isVerified);
})();
