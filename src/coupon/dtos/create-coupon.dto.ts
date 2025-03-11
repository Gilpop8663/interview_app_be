import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Coupon } from '../entities/coupon.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateCouponInput extends PickType(Coupon, [
  'code',
  'expirationDate',
  'isActive',
]) {}

@ObjectType()
export class CreateCouponOutput extends CoreOutput {}
