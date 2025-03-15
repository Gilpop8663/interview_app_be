import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  Unique,
} from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsNumber, Length } from 'class-validator';

import { registerEnumType } from '@nestjs/graphql';
import { Order } from 'src/orders/entities/order.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SubscriptionType {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum TaskType {
  ANSWER_SUBMITTED = 'answerSubmitted',
}

registerEnumType(UserRole, {
  name: 'UserRole', // 이 이름은 GraphQL 스키마에서 사용됩니다.
});

registerEnumType(SubscriptionType, {
  name: 'SubscriptionType',
});

registerEnumType(TaskType, {
  name: 'TaskType', // 이 이름은 GraphQL 스키마에서 사용됩니다.
});

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
@Unique(['email'])
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @Length(8, 64)
  password: string;

  @Column({ default: 100 })
  @Field(() => Number)
  @IsNumber()
  point: number;

  @Column()
  @Field(() => String)
  @Length(2, 20)
  nickname: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @Field(() => UserRole)
  role: UserRole;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE,
  })
  @Field(() => SubscriptionType)
  subscriptionType: SubscriptionType;

  @Column({ type: 'timestamp', nullable: true })
  lastActive: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginDate: Date;

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.user)
  order: Order[];

  @Column({ default: 0 })
  @Field(() => Number)
  answerSubmittedCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  premiumStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Field(() => Date, { nullable: true })
  premiumEndDate: Date;

  @Column('simple-array', { nullable: true })
  @Field(() => [String], { nullable: true }) // GraphQL에서 배열로 반환
  usedCoupons: string[]; // 사용한 쿠폰 코드 목록

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) return;

    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(password: string) {
    try {
      const ok = await bcrypt.compare(password, this.password);

      return ok;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
