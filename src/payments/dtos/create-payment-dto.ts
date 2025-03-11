import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Payment } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'amount',
  'currency',
]) {
  @Field(() => Number)
  orderId: number;

  @Field(() => String, { nullable: true })
  transactionId?: string; // 결제 트랜잭션 ID
}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  paymentId?: number;
}
