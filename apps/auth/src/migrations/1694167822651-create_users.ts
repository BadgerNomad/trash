import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class createUsers1694167822651 implements MigrationInterface {
  private readonly _TABLE_NAME = 'users';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: this._TABLE_NAME,
      columns: [
        {
          name: 'id',
          isPrimary: true,
          type: 'integer',
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'email',
          type: 'varchar',
          isUnique: true,
        },
        {
          name: 'password',
          type: 'varchar',
          isNullable: true,
        },
        {
          name: 'email_verified',
          type: 'boolean',
          default: 'false',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
        },
      ],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this._TABLE_NAME);
  }
}
