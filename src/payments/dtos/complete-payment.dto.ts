import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Payment } from '../entities/payment.entity';

@InputType()
export class CompletePaymentInput extends PickType(Payment, ['transactionId']) {
  @Field(() => Number)
  paymentId: number;

  @Field(() => Number)
  orderId: number;
}

@ObjectType()
export class CompletePaymentOutput extends CoreOutput {}
