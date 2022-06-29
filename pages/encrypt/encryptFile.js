"use strict";
// returns URL of the encrypted Blob object
const encryptFile = async (blobUrl, password) => {
    // PBKDF2 generates a secure encryption key from a password, this reduces vulnerabilities of brute-force attack,
    // this key is used to create Cryptographic key as well as Initialization Vector (IV) for AES-CBC encryption,
    // the encrypted file is also salted
    let blob = await fetch(blobUrl)
        .then(res => res.blob())
        .catch((err) => { console.error(err); return null; });
    if (!blob)
        return null;
    let fileU8Arr = await blob.arrayBuffer()
        .then(res => res)
        .catch((err) => { console.error(err); return null; });
    if (!fileU8Arr)
        return null;
    fileU8Arr = new Uint8Array(fileU8Arr);
    const textEnc = new TextEncoder();
    const passphraseU8Arr = textEnc.encode(password);
    const pbkdf2Iteration = 10000; // number of times hash function is called in PBKDF2 algorithm
    const pbkdf2Salt = window.crypto.getRandomValues(new Uint8Array(8));
    // generate cryptographic key for PBKDF2 
    const passphraseKey = await window.crypto.subtle.importKey('raw', passphraseU8Arr, { name: 'PBKDF2' }, false, ['deriveBits'])
        .catch((err) => { console.error(err); return null; });
    if (!passphraseKey)
        return null;
    // derive array of bits from passphraseKey
    let pbkdf2U8Arr = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: pbkdf2Salt, iterations: pbkdf2Iteration, hash: 'SHA-256' }, passphraseKey, 384)
        .catch((err) => { console.error(err); return null; });
    if (!pbkdf2U8Arr)
        return null;
    pbkdf2U8Arr = new Uint8Array(pbkdf2U8Arr);
    const keyU8Arr = pbkdf2U8Arr.slice(0, 32); // key for AES encryption
    const ivU8Arr = pbkdf2U8Arr.slice(32); // Initialization Vector to be used along with key for AES encryption
    // generate cryptographic key for AES-CBC
    const key = await window.crypto.subtle.importKey('raw', keyU8Arr, { name: 'AES-CBC', length: 256 }, false, ['encrypt'])
        .catch((err) => { console.error(err); return null; });
    if (!key)
        return null;
    // encrypt file using AES-CBC
    let cipherBytes = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv: ivU8Arr }, key, fileU8Arr)
        .catch((err) => { console.error(err); return null; });
    if (!cipherBytes)
        return null;
    cipherBytes = new Uint8Array(cipherBytes);
    // add salt
    const resultU8Arr = new Uint8Array(cipherBytes.length + 16);
    resultU8Arr.set(textEnc.encode('Salted__')); // 'Salted__' string present from index 0 to 7
    resultU8Arr.set(pbkdf2Salt, 8); // salt present from index 8 to 15
    resultU8Arr.set(cipherBytes, 16); // ciphertext present fromindex 16 to remaining
    blob = new Blob([resultU8Arr], { type: 'application/download' });
    return URL.createObjectURL(blob);
};
// return URL of the decrypted Blob object
const decryptFile = async (blobUrl, password) => {
    // PBKDF2 generates a secure encryption key from a password, this reduces vulnerabilities of brute-force attack,
    // this key is used to create Cryptographic key as well as Initialization Vector (IV) for AES-CBC encryption,
    // the encrypted file is also salted
    let blob = await fetch(blobUrl)
        .then(res => res.blob())
        .catch((err) => { console.error(err); return null; });
    if (!blob)
        return null;
    let cipherBytes = await blob.arrayBuffer()
        .then(res => res)
        .catch((err) => { console.error(err); return null; });
    if (!cipherBytes)
        return null;
    cipherBytes = new Uint8Array(cipherBytes);
    const textEnc = new TextEncoder();
    const passphraseU8Arr = textEnc.encode(password);
    const pbkdf2Iteration = 10000; // number of times hash function is called in PBKDF2 algorithm
    const pbkdf2Salt = cipherBytes.slice(8, 16); // salt present from index 8 to 15
    // generate cryptographic key for PBKDF2 
    const passphraseKey = await window.crypto.subtle.importKey('raw', passphraseU8Arr, { name: 'PBKDF2' }, false, ['deriveBits'])
        .catch((err) => { console.error(err); return null; });
    if (!passphraseKey)
        return null;
    // derive array of bits from passphraseKey
    let pbkdf2U8Arr = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: pbkdf2Salt, iterations: pbkdf2Iteration, hash: 'SHA-256' }, passphraseKey, 384)
        .catch((err) => { console.error(err); return null; });
    if (!pbkdf2U8Arr)
        return null;
    pbkdf2U8Arr = new Uint8Array(pbkdf2U8Arr);
    const keyU8Arr = pbkdf2U8Arr.slice(0, 32); // key for AES decryption
    const ivU8Arr = pbkdf2U8Arr.slice(32); // Initialization Vector to be used along with key for AES decryption
    cipherBytes = cipherBytes.slice(16); // encrypted file cihpertext present from index 16 to remaining
    // generate cryptographic key for AES-CBC
    const key = await window.crypto.subtle.importKey('raw', keyU8Arr, { name: 'AES-CBC', length: 256 }, false, ['decrypt'])
        .catch((err) => { console.error(err); return null; });
    if (!key)
        return null;
    // decrypt file using AES-CBC
    let plainTextBytes = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv: ivU8Arr }, key, cipherBytes)
        .catch((err) => { console.error(err); return null; });
    if (!cipherBytes)
        return null;
    plainTextBytes = new Uint8Array(plainTextBytes);
    blob = new Blob([plainTextBytes], { type: 'application/download' });
    return URL.createObjectURL(blob);
};
