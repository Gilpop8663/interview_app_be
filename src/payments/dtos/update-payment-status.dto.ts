import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Payment } from '../entities/payment.entity';

@InputType()
export class UpdatePaymentStatusInput extends PickType(Payment, [
  'status',
  'transactionId',
]) {
  @Field(() => Number)
  paymentId: number;
}

@ObjectType()
export class UpdatePaymentStatusOutput extends CoreOutput {}
