import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Coupon } from '../entities/coupon.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GetCouponDetailInput {
  @Field(() => Number)
  couponId: number;
}

@ObjectType()
export class GetCouponDetailOutput extends CoreOutput {
  @Field(() => Coupon, { nullable: true })
  coupon?: Coupon;
}
