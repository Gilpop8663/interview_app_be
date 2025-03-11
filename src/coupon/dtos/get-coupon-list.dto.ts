import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Coupon } from '../entities/coupon.entity';

@InputType()
export class GetCouponListInput {}

@ObjectType()
export class GetCouponListOutput extends CoreOutput {
  @Field(() => [Coupon], { nullable: true })
  couponList?: Coupon[];
}
