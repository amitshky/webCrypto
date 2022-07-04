import { webcrypto } from 'crypto';
const crypto = webcrypto as unknown as Crypto;

(async () =>
{
	const text = Buffer.from('hello', 'utf-8');
	const digest = await crypto.subtle.digest({ name: 'SHA-256' }, text);
	console.log(Buffer.from(digest).toString('base64'));
})()