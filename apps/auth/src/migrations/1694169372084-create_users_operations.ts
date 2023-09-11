import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class createUsersOperations1694169372084 implements MigrationInterface {
  private readonly _TABLE_NAME = 'users_operations';

  private readonly _USERS_OPERATIONS_USER_ID_FK = 'users_operations_user_id_fk';

  private readonly _USERS_OPERATIONS_USER_ID_IDX =
    'users_operations_user_id_idx';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const userIdFk = this._fk();

    const table = new Table({
      name: this._TABLE_NAME,
      columns: [
        {
          name: 'id',
          isPrimary: true,
          type: 'int',
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'user_id',
          type: 'integer',
        },
        {
          name: 'type',
          type: 'varchar',
          length: '2',
          isNullable: false,
        },
        {
          name: 'ttl',
          type: 'timestamp',
        },
        { name: 'token', type: 'varchar' },
        {
          name: 'data',
          type: 'jsonb',
          isNullable: true,
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
      foreignKeys: [userIdFk],
    });

    await queryRunner.createTable(table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userIdFk = this._fk();

    await queryRunner.dropForeignKey(this._TABLE_NAME, userIdFk);
    await queryRunner.dropTable(this._TABLE_NAME);
  }

  private _fk() {
    const userIdFk = new TableForeignKey({
      name: this._USERS_OPERATIONS_USER_ID_FK,
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    return userIdFk;
  }
}
