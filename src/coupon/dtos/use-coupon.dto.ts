import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Coupon } from '../entities/coupon.entity';

@InputType()
export class UseCouponInput extends PickType(Coupon, ['code']) {}

@ObjectType()
export class UseCouponOutput extends CoreOutput {}
