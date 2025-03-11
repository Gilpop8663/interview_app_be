import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { SubscriptionType, User } from 'src/users/entities/user.entity';
import { UseCouponInput, UseCouponOutput } from './dtos/use-coupon.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import {
  DeleteCouponInput,
  DeleteCouponOutput,
} from './dtos/delete-coupon.dto';
import { GetCouponListOutput } from './dtos/get-coupon-list.dto';
import {
  UpdateCouponInput,
  UpdateCouponOutput,
} from './dtos/update-coupon.dto';
import {
  CreateCouponInput,
  CreateCouponOutput,
} from './dtos/create-coupon.dto';
import {
  GetCouponDetailInput,
  GetCouponDetailOutput,
} from './dtos/get-coupon-detail.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // User 레포지토리 주입
    private readonly i18n: I18nService,
  ) {}

  async useCoupon(
    { code }: UseCouponInput,
    userId: number,
  ): Promise<UseCouponOutput> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { code, isActive: true },
      });

      if (!coupon) {
        const invalid_or_inactive_coupon = this.i18n.t(
          'error.invalid_or_inactive_coupon',
          {
            lang: I18nContext.current().lang,
          },
        );

        throw new Error(invalid_or_inactive_coupon);
      }

      // 만료일 확인
      if (coupon.expirationDate && new Date() > coupon.expirationDate) {
        const expired_coupon = this.i18n.t('error.coupon_has_expired', {
          lang: I18nContext.current().lang,
        });

        throw new Error(expired_coupon);
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        const user_not_found = this.i18n.t('error.user_not_found', {
          lang: I18nContext.current().lang,
        });

        throw new Error(user_not_found);
      }

      // 이미 사용한 쿠폰인지 확인
      if (user.usedCoupons && user.usedCoupons.includes(code)) {
        const coupon_used = this.i18n.t('error.coupon_has_already_been_used', {
          lang: I18nContext.current().lang,
        });

        throw new Error(coupon_used);
      }

      user.subscriptionType = SubscriptionType.PREMIUM; // 프리미엄으로 변경

      const currentDate = new Date();

      if (user.premiumEndDate && user.premiumEndDate > new Date()) {
        // 기존 구독 기간이 있는 경우, 기존 날짜에 한 달 추가
        user.premiumEndDate = new Date(
          user.premiumEndDate.setMonth(user.premiumEndDate.getMonth() + 1),
        );
      } else {
        // 기존 구독 기간이 없는 경우, 현재 날짜로부터 한 달 뒤로 설정
        user.premiumEndDate = new Date(
          currentDate.setMonth(currentDate.getMonth() + 1),
        );
      }

      user.usedCoupons = [...(user.usedCoupons || []), code]; // 사용한 쿠폰 코드 추가

      coupon.isActive = false;
      await this.couponRepository.save(coupon); // 쿠폰 상태 업데이트

      await this.userRepository.save(user); // 변경 사항 저장

      return { ok: true };
    } catch (error) {
      const errorMessage = this.i18n.t('error.coupon_usage_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: error.message || errorMessage };
    }
  }

  async createCoupon(input: CreateCouponInput): Promise<CreateCouponOutput> {
    try {
      const coupon = this.couponRepository.create(input);
      await this.couponRepository.save(coupon);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async updateCoupon({
    couponId,
    code,
    expirationDate,
    isActive,
  }: UpdateCouponInput): Promise<UpdateCouponOutput> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { id: couponId },
      });

      if (code) {
        coupon.code = code;
      }

      if (expirationDate) {
        coupon.expirationDate = expirationDate;
      }

      if (isActive) {
        coupon.isActive = isActive;
      }

      await this.couponRepository.save(coupon);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async deleteCoupon({
    couponId,
  }: DeleteCouponInput): Promise<DeleteCouponOutput> {
    try {
      await this.couponRepository.delete(couponId);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getCouponDetail({
    couponId,
  }: GetCouponDetailInput): Promise<GetCouponDetailOutput> {
    try {
      const coupon = await this.couponRepository.findOne({
        where: { id: couponId },
      });

      return { ok: true, coupon };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getCouponList(): Promise<GetCouponListOutput> {
    try {
      const couponList = await this.couponRepository.find();
      return { ok: true, couponList };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
