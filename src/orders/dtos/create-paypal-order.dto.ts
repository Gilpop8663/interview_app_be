import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PaypalOrderData } from './capture-paypal-order.dto';
import { Column } from 'typeorm';

@InputType()
export class CreatePaypalOrderInput {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Field(() => Float)
  amount: number;
}

@ObjectType()
export class CreatePaypalOrderOutput extends CoreOutput {
  @Field(() => PaypalOrderData, { nullable: true })
  orderData?: PaypalOrderData;

  @Field(() => Number, { nullable: true })
  orderId?: number;
}
