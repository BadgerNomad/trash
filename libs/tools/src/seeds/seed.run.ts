/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'fs';
import { GlobSync } from 'glob';
import path from 'path';
import { Connection, ConnectionOptions } from 'typeorm';

async function main(ormConfigPath: string) {
  const _ormConfigPath = path.resolve(process.cwd(), ormConfigPath);
  const ormConfig = JSON.parse(
    fs.readFileSync(_ormConfigPath).toString(),
  ) as ConnectionOptions & { seeds: string[] };

  const seeds = [];

  for (const pattern of ormConfig.seeds) {
    const glob = new GlobSync(pattern);

    const seedsFiles = glob.found;

    for (const seedPath of seedsFiles) {
      const _seedPath = path.resolve(process.cwd(), seedPath);

      const seed = (await import(_seedPath)).default;
      seeds.push(seed);
    }
  }

  const connection = new Connection({
    ...ormConfig,
  });

  await connection.connect();

  for (const SeedType of seeds) {
    const seed = new SeedType();

    try {
      await seed.run(connection);
    } catch (err) {
      console.log('err', err);
    }
  }

  await connection.close();
}

const [ormConfigPath] = process.argv.slice(2);
void main(ormConfigPath);
