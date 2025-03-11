import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { IsNumber, IsPositive, Length } from 'class-validator';
import { Order } from 'src/orders/entities/order.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Product extends CoreEntity {
  @Column()
  @Field(() => String)
  @Length(2, 64)
  name: string;

  @Column()
  @Field(() => String)
  @Length(2, 500)
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  price: number;

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.product)
  order: Order[];
}
