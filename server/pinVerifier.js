/*
Copyright (c) 2024 Piloking
Released under the MIT license
https://opensource.org/license/mit
*/


import { Key } from 'npm:node-bignumber';

class PinVerifier {
  constructor(message) {
    this.message = message
  }

  getRSACrypto(json) {
    const message = this.message
    const rsa = new Key();
    rsa.setPublic(json[2], json[3]);
    const credentials = rsa.encrypt(message).toString('hex');
    const keyname = json[1];
    return { keyname, credentials, message };
  }
}


export default PinVerifier;