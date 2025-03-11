import { Module } from '@nestjs/common';
import { CouponResolver } from './coupon.resolver';
import { CouponService } from './coupon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, User])],
  providers: [CouponService, CouponResolver],
})
export class CouponModule {}
