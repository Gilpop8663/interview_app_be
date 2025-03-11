import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsEnum } from 'class-validator';
import { Order } from 'src/orders/entities/order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
});

export enum Currency {
  KRW = 'KRW', // 한국 원화
  USD = 'USD', // 미국 달러
}

registerEnumType(Currency, {
  name: 'Currency',
});

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @ManyToOne(() => Order, (order) => order.id, { onDelete: 'CASCADE' })
  @Field(() => Order)
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @Field(() => Float)
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Field(() => PaymentStatus)
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  transactionId?: string; // 결제 트랜잭션 ID

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.KRW, // 기본값을 한국 원화로 설정
  })
  @Field(() => Currency)
  @IsEnum(Currency)
  currency: Currency; // 통화 필드
}
