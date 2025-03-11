import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseCouponInput, UseCouponOutput } from './dtos/use-coupon.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CouponService } from './coupon.service';
import {
  CreateCouponInput,
  CreateCouponOutput,
} from './dtos/create-coupon.dto';
import {
  UpdateCouponInput,
  UpdateCouponOutput,
} from './dtos/update-coupon.dto';
import { GetCouponListOutput } from './dtos/get-coupon-list.dto';
import {
  DeleteCouponInput,
  DeleteCouponOutput,
} from './dtos/delete-coupon.dto';
import { AdminGuard } from 'src/admin/admin.guard';
import {
  GetCouponDetailInput,
  GetCouponDetailOutput,
} from './dtos/get-coupon-detail.dto';

@Resolver()
export class CouponResolver {
  constructor(private readonly couponsService: CouponService) {}

  // 쿠폰 생성
  @Mutation(() => CreateCouponOutput)
  @UseGuards(AdminGuard) // 인증 가드 적용
  async createCoupon(
    @Args('input') input: CreateCouponInput,
  ): Promise<CreateCouponOutput> {
    return this.couponsService.createCoupon(input);
  }

  // 쿠폰 수정
  @Mutation(() => UpdateCouponOutput)
  @UseGuards(AdminGuard) // 인증 가드 적용
  async updateCoupon(
    @Args('input') input: UpdateCouponInput,
  ): Promise<UpdateCouponOutput> {
    return this.couponsService.updateCoupon(input);
  }

  // 쿠폰 삭제
  @Mutation(() => DeleteCouponOutput)
  @UseGuards(AdminGuard) // 인증 가드 적용
  async deleteCoupon(
    @Args('input') input: DeleteCouponInput,
  ): Promise<DeleteCouponOutput> {
    return this.couponsService.deleteCoupon(input);
  }

  // 쿠폰 조회
  @Query(() => GetCouponListOutput)
  @UseGuards(AdminGuard) // 인증 가드 적용
  async getCouponList(): Promise<GetCouponListOutput> {
    return this.couponsService.getCouponList();
  }

  // 쿠폰 조회
  @Query(() => GetCouponDetailOutput)
  @UseGuards(AdminGuard) // 인증 가드 적용
  async getCouponDetail(
    @Args('input') input: GetCouponDetailInput,
  ): Promise<GetCouponDetailOutput> {
    return this.couponsService.getCouponDetail(input);
  }

  // 쿠폰 사용
  @Mutation(() => UseCouponOutput)
  @UseGuards(AuthGuard) // 인증 가드 적용
  async useCoupon(
    @Args('input') input: UseCouponInput,
    @AuthUser() user: User,
  ): Promise<UseCouponOutput> {
    return this.couponsService.useCoupon(input, user.id);
  }
}
