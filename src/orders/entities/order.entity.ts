import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IsEnum } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Currency, Payment } from 'src/payments/entities/payment.entity';

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @Field(() => User)
  user: User;

  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  @Field(() => Product)
  product: Product; // 단일 상품 참조

  @Field(() => [Payment])
  @OneToMany(() => Payment, (payment) => payment.order)
  payment: Payment[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @Field(() => Float)
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.KRW, // 기본값을 한국 원화로 설정
  })
  @Field(() => Currency)
  @IsEnum(Currency)
  currency: Currency; // 통화 필드
}
