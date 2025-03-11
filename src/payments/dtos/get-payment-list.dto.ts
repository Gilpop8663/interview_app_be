import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Payment } from '../entities/payment.entity';

@InputType()
export class GetPaymentListInput {}

@ObjectType()
export class GetPaymentListOutput extends CoreOutput {
  @Field(() => [Payment], { nullable: true })
  paymentList?: Payment[];
}
