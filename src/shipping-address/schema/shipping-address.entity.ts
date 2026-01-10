import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/schema/user.entity';

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other',
}

@Entity()
export class ShippingAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  street_address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zip_code: string;

  @Column()
  country: string;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.HOME })
  address_type: AddressType;

  @Column({ nullable: true })
  label: string;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

