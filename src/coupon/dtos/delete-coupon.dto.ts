import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteCouponInput {
  @Field(() => Number)
  couponId: number;
}

@ObjectType()
export class DeleteCouponOutput extends CoreOutput {}
