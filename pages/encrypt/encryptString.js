"use strict";
const encrypt = (data, secretKey) => {
    const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
    return encrypted;
};
const decrypt = (data, secretKey) => {
    const decrypted = CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
    return decrypted;
};
