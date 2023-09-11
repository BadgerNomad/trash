import {
  BaseEntity,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import User from './user.entity';

export enum UserOperationType {
  SIGN_UP = 'su',
  SIGN_UP_CONFIRM = 'sc',
  PASSWORD_RECOVERY = 'pr',
  PASSWORD_CHANGE = 'pc',
  EMAIL_CHANGE = 'ec',
  EMAIL_SIGN = 'es',
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IUserOperationData {}

export interface IPasswordChangeData extends IUserOperationData {
  password?: string;
}

export interface IEmailChangeData extends IUserOperationData {
  email?: string;
}

@Entity({
  name: 'users_operations',
})
export default class UserOperation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  type: UserOperationType;

  @Column()
  ttl: Date;

  @Column()
  token: string;

  @Column({
    type: 'jsonb',
  })
  data: IUserOperationData;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    select: false,
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @BeforeUpdate()
  private setUpdateDate(): void {
    this.updated_at = new Date();
  }
}
