import fs from 'fs';
import path from 'path';
import { Connection } from 'typeorm';

export default abstract class SeedAbstract {
  abstract run(connection: Connection): Promise<void>;

  protected loadSeeds<Seeds>(fileName: string): Seeds[] {
    // Reade file csv
    const scv = path.resolve(process.cwd(), 'store', `${fileName}.csv`);
    const data = fs.readFileSync(scv, 'utf8');

    // CSV to array
    const sliced = data
      .trimEnd()
      .replace(/,\s*$/, '')
      .split('\n')
      .map((v) => v.split(','));
    const columnNames = sliced.shift();

    return sliced.map<Seeds>((slice) => {
      const obj = {};
      slice.forEach((value, index) => {
        value = value === 'null' ? null : value;

        Object.assign(obj, { [columnNames[index]]: value });
      });

      return obj as Seeds;
    });
  }
}
