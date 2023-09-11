import fs from 'fs';

import { Connection, ConnectionOptions, createConnection } from 'typeorm';

import { CreatingSchemas } from '@libs/types';

async function createSchemas(): Promise<void> {
  const ormConfig = JSON.parse(
    fs.readFileSync('./apps/auth/ormconfig.json', 'utf-8'),
  ) as ConnectionOptions;
  const connection: Connection = await createConnection(ormConfig);

  try {
    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    for (const schema of CreatingSchemas) {
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    }

    await queryRunner.release();
  } catch (error) {
    console.error('Error creating schemas:', error);
  } finally {
    await connection.close();
  }
}

void createSchemas();
