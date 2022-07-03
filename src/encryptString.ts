import { webcrypto } from 'node:crypto'
const crypto = webcrypto as unknown as Crypto;

const encrypt = async (plaintext: string, password: string): Promise<string> =>
{
	const enc = new TextEncoder();

	const plaintextU8Arr: Uint8Array = enc.encode(plaintext);
	const passwordU8Arr: Uint8Array  = enc.encode(password);

	const pbkdf2Salt: Uint8Array = crypto.getRandomValues(new Uint8Array(8));
	const pbkdf2Key: CryptoKey = await crypto.subtle.importKey('raw', passwordU8Arr, { name: 'PBKDF2' }, false, ['deriveBits']);
	const pbkdf2KeyU8Arr: Uint8Array = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', iterations: 10000, salt: pbkdf2Salt, hash: 'SHA-256' }, pbkdf2Key, 384));

	const key: CryptoKey = await crypto.subtle.importKey('raw', pbkdf2KeyU8Arr.slice(0, 32), { name: 'AES-CBC', length: 256 }, false, ['encrypt']);
	const iv: Uint8Array = pbkdf2KeyU8Arr.slice(32);

	const encryptedU8Arr: Uint8Array = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, key, plaintextU8Arr));
	const cipherU8Arr = new Uint8Array(encryptedU8Arr.length + 16);
	cipherU8Arr.set(enc.encode('Salted__'));
	cipherU8Arr.set(pbkdf2Salt, 8);
	cipherU8Arr.set(encryptedU8Arr, 16);
	const ciphertext: string = Buffer.from(cipherU8Arr).toString('base64');

	return ciphertext;
}

const decrypt = async (ciphertext: string, password: string): Promise<string> =>
{
	const cipherU8Arr: Uint8Array   = new Uint8Array(Buffer.from(ciphertext, 'base64'));
	const passwordU8Arr: Uint8Array = new TextEncoder().encode(password);

	const pbkdf2Salt: Uint8Array = cipherU8Arr.slice(8, 16);
	const pbkdf2Key: CryptoKey = await crypto.subtle.importKey('raw', passwordU8Arr, { name: 'PBKDF2' }, false, ['deriveBits']);
	const pbkdf2KeyU8Arr: Uint8Array = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', iterations: 10000, salt: pbkdf2Salt, hash: 'SHA-256' }, pbkdf2Key, 384));

	const key: CryptoKey = await crypto.subtle.importKey('raw', pbkdf2KeyU8Arr.slice(0, 32), { name: 'AES-CBC', length: 256 }, false, ['decrypt']);
	const iv: Uint8Array = pbkdf2KeyU8Arr.slice(32);

	const plaintextU8Arr: Uint8Array = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, key, cipherU8Arr.slice(16)));
	const plaintext: string = Buffer.from(plaintextU8Arr).toString('utf-8');

	return plaintext;
}

(() =>
{
	const inputStr: string = 'hello';
	const password: string = 'password';
	console.log('input string:', inputStr);

	encrypt(inputStr, password)
		.then((res) => 
		{
			console.log('encrypted string:', res);
			decrypt(res, password)
				.then((res) => 
				{
					console.log('decrypted string:', res);
				})
				.catch(err => console.error(`Unable decrypt the input string! ERROR:\n`, err));
		})
		.catch(err => console.error(`Unable encrypt the input string! ERROR:\n`, err));
})();