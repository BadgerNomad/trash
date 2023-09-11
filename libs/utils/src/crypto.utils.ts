import * as crypto from 'crypto';
import hmacSha256 from 'crypto-js/hmac-sha256';
import sha256 from 'crypto-js/sha256';

interface IGetJsonPayloadResponse {
  iv: string;
  value: string;
  mac: string;
}

const DEFAULT_SETTINGS = {
  algorithm: 'aes-256-cbc',
  sha: 'sha256',
  key: Buffer.from('bDHCA+O80kSJFGbz+tRb7H8XSUGULOUhLhthkM57LGE=', 'base64'),
};

export interface ICryptoOptions {
  key?: string;
  sha?: string;
  algorithm?: string;
}

export default class CryptoUtils {
  private _algorithm: string;
  private _sha: string;
  private _key: Buffer;

  constructor(options: ICryptoOptions = {}) {
    this._algorithm = DEFAULT_SETTINGS.algorithm;
    this._sha = DEFAULT_SETTINGS.sha;
    this._key = DEFAULT_SETTINGS.key;

    if (options.algorithm) {
      this._algorithm = options.algorithm;
    }

    if (options.sha) {
      this.sha = options.sha;
    }

    if (options.key) {
      this.key = options.key;
    }
  }

  public set algorithm(algorithm: string) {
    this._algorithm = algorithm;
  }

  public set sha(sha: string) {
    this._sha = sha;
  }

  public set key(key: string) {
    this._key = Buffer.from(key, 'base64');
  }

  private _hashDeserialize(str: string): string {
    return str
      .substring(str.indexOf('"') + 1, str.lastIndexOf(';'))
      .replace(/"/g, '');
  }

  private _getJsonPayload(payload: string): IGetJsonPayloadResponse {
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString());
    } catch (e) {
      throw new Error('Payload cannot be parsed !');
    }
  }

  private _hashSerialize(str: string): string {
    return 's:' + str.length + ':"' + str + ';"';
  }

  private _hashHmac(data: string, key: Buffer): string {
    const hmac = crypto.createHmac(this._sha, key);
    hmac.update(data);

    return hmac.digest('hex');
  }

  private _hash(iv: string, value: string): string {
    const data = iv + value;
    return this._hashHmac(data, this._key);
  }

  /**
   * Encrypt data with crypto library
   * @param value data
   * @returns encrypted data
   */

  public encrypt(value: string | number): string {
    const _iv = crypto.randomBytes(16);
    const serializedValue = this._hashSerialize(<string>value);

    const base64_iv = _iv.toString('base64');

    const cipher = crypto.createCipheriv(this._algorithm, this._key, _iv);

    let encrypted = cipher.update(serializedValue, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const _mac = this._hash(base64_iv, encrypted);

    const payloadObject = {
      iv: base64_iv,
      value: encrypted,
      mac: _mac,
    };

    const base64_payload = Buffer.from(JSON.stringify(payloadObject)).toString(
      'base64',
    );

    return base64_payload;
  }

  /**
   * Decrypt hash with crypto library
   * @param payload hash
   * @returns decrypted data
   */

  public decrypt(payload: string): string {
    const _payload = this._getJsonPayload(payload);
    const _iv = Buffer.from(_payload['iv'], 'base64');

    const decipher = crypto.createDecipheriv(this._algorithm, this._key, _iv);

    let decrypter = decipher.update(_payload['value'], 'base64', 'utf8');
    decrypter += decipher.final('utf8');

    return this._hashDeserialize(decrypter);
  }

  /**
   * Get hash for message with crypto-js/sha256 library
   * @param message
   * @returns hash
   */

  static sha256(message: string, toString = false): string | object {
    const hash = <object>sha256(message);

    if (toString) {
      return String(hash);
    }

    return hash;
  }

  /**
   * Recovery hash for message by public key with crypto-js/hmac-sha256 library
   * @param message
   * @returns hash
   */

  static hmacSha256(message: string, key: string) {
    const hash = String(hmacSha256(message, key));

    return hash;
  }
}
