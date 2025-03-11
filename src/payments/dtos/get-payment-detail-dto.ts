import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Payment } from '../entities/payment.entity';

@InputType()
export class GetPaymentDetailInput {
  @Field(() => Number)
  paymentId: number;
}

@ObjectType()
export class GetPaymentDetailOutput extends CoreOutput {
  @Field(() => Payment, { nullable: true })
  payment?: Payment;
}
