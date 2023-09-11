import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export default abstract class Utils {
  static getUUID(): string {
    return uuidv4();
  }

  static async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  static randomInt(max = 100000000) {
    return Math.floor(Math.random() * max);
  }

  static isHexStrict(hex: string) {
    return (
      (typeof hex === 'string' || typeof hex === 'number') &&
      /^(-)?0x[0-9a-f]*$/i.test(hex)
    );
  }

  static randomBytes(length = 48) {
    const random = crypto.randomBytes(length);

    return random.toString('hex');
  }

  static randomBlockchainHash(length = 32) {
    const random = crypto.randomBytes(length);

    return '0x' + random.toString('hex');
  }

  static stringInject(str: string, data: string[]): string {
    const response = str.replace(/({\d})/g, function (i) {
      return data[i.replace(/{/, '').replace(/}/, '')];
    });

    return response;
  }

  static quotesEscape(data: string) {
    return data.replace(new RegExp(/[`'"]/gi), (match) => `\\${match}`);
  }

  static isBase58(value: string) {
    return /^[A-HJ-NP-Za-km-z1-9]*$/.test(value);
  }

  static isEthAddress(value: string) {
    return /^0x[a-fA-F0-9]{40}$/g.test(value);
  }

  static replaceText(replacements: object, ...texts: string[]): string[] {
    return texts.map((text: string) => {
      Object.entries(replacements).forEach(([key, value]) => {
        text = text.replaceAll(key, value);
      });

      return text;
    });
  }

  static isNumberCheck(items: number | number[]) {
    if (Array.isArray(items)) {
      return items.every((item) => typeof item === 'number' && !isNaN(item));
    }

    return typeof items === 'number';
  }

  static getShortAddress(
    address: string,
    variant: 'long' | 'short' = 'short',
  ): string {
    if (!address) {
      return '';
    }

    const { length } = address;
    const trimLength = 4;

    if (variant === 'long') {
      return `${address.slice(0, 2)}...${address.slice(
        length - trimLength,
        length,
      )}`;
    }

    return `...${address.slice(length - trimLength, length)}`;
  }
}
