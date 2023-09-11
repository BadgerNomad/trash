import * as bcrypt from 'bcrypt';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  email_verified: boolean;

  @CreateDateColumn({
    name: 'created_at',
    select: false,
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    select: false,
  })
  updated_at: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    this.email = this.email ? this.email.toLowerCase() : this.email;
  }

  @BeforeUpdate()
  private setUpdateDate(): void {
    this.updated_at = new Date();
  }

  @BeforeInsert()
  @BeforeUpdate()
  private _encryptPassword(): void {
    if (!this.password) {
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);

    this.password = hash;
  }

  passwordCompare(pwd: string): boolean {
    if (!this.password) {
      return false;
    }

    return bcrypt.compareSync(pwd, this.password.replace(/^\$2y/, '$2a'));
  }
}
