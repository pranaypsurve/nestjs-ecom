import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique('UQ_USER_EMAIL', ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ default: 'user' })
  role: string;
  @Column({ nullable: true })
  phone?: string;
  @Column({ nullable: true })
  profile_picture?: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  @Column({ type: 'datetime', nullable: true })
  last_login?: Date;
  @Column({ default: true })
  is_active: boolean;
}
