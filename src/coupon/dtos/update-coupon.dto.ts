import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Coupon } from '../entities/coupon.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class UpdateCouponInput extends PickType(Coupon, [
  'code',
  'expirationDate',
  'isActive',
]) {
  @Field(() => Number)
  couponId: number;
}

@ObjectType()
export class UpdateCouponOutput extends CoreOutput {}
