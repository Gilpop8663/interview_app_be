import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubscriptionType,
  TaskType,
  User,
  UserRole,
} from './entities/user.entity';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { getRandomNickname, logErrorAndThrow } from 'src/utils';
import {
  DeleteAccountInput,
  DeleteAccountOutput,
} from './dtos/delete-account.dto';
import { Response } from 'express';
import { CheckEmailInput, CheckEmailOutput } from './dtos/check-email.dto';
import {
  UpdateSubscriptionTypeInput,
  UpdateSubscriptionTypeOutput,
} from './dtos/update-subscription-type.dto';
import {
  DecreaseUserPointsInput,
  DecreaseUserPointsOutput,
} from './dtos/decrease-user-points.dto';
import { UpdateUserPointsAndStatisticsInput } from './dtos/update-user-points-and-statistics.dto';
import {
  UpdateStatisticsInput,
  UpdateStatisticsOutput,
} from './dtos/update-statistics.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { GetUserListOutput } from './dtos/get-user-list.dto';
import {
  EditUserSubscriptionTypeInput,
  EditUserSubscriptionTypeOutput,
} from './dtos/edit-user-subscription-type.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async createAccount(
    { email, password }: CreateAccountInput,
    @Res() res: Response,
    cookieDomain: string,
  ): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      const lang = I18nContext.current().lang;
      const nickname = getRandomNickname(lang);

      const existEmail = await this.users.findOne({ where: { email } });

      if (existEmail) {
        const result = await this.login(
          { email, password, rememberMe: true },
          res,
          cookieDomain,
        );

        return result;
      }

      const newUser = this.users.create({
        email,
        password,
        nickname,
        subscriptionType: SubscriptionType.PREMIUM,
        premiumStartDate: new Date(), // 현재 날짜로 설정
        premiumEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후로 설정
      });

      await this.users.save(newUser);

      const result = await this.login(
        { email, password, rememberMe: true },
        res,
        cookieDomain,
      );

      return result;
    } catch (error) {
      const account_creation_failed = this.i18n.t(
        'error.account_creation_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: account_creation_failed };
    }
  }

  async checkEmail({ email }: CheckEmailInput): Promise<CheckEmailOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });

      const email_already_in_use = this.i18n.t('error.email_already_in_use', {
        lang: I18nContext.current().lang,
      });

      if (user) {
        return { ok: false, error: email_already_in_use };
      }

      return { ok: true };
    } catch (error) {
      const email_duplicate_check_failed = this.i18n.t(
        'error.email_duplicate_check_failed',
        {
          lang: I18nContext.current().lang,
        },
      );
      return logErrorAndThrow(error, email_duplicate_check_failed);
    }
  }

  async login(
    { email, password, rememberMe }: LoginInput,
    @Res() res: Response,
    cookieDomain: string,
  ) {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['password', 'id'],
      });

      if (!user) {
        const user_id_not_found = this.i18n.t('error.user_id_not_found', {
          lang: I18nContext.current().lang,
        });

        return {
          ok: false,
          error: user_id_not_found,
        };
      }

      const isPasswordCorrect = await user.checkPassword(password);
      if (!isPasswordCorrect) {
        const incorrect_password = this.i18n.t('error.incorrect_password', {
          lang: I18nContext.current().lang,
        });

        console.log(incorrect_password, I18nContext.current().lang);

        return {
          ok: false,
          error: incorrect_password,
        };
      }

      await this.updateLastActive(user.id);
      await this.rewardLoginPoints(user.id);

      const accessTokenExpiry = cookieDomain.includes('chrome-extension')
        ? '100y'
        : '1h';

      // 액세스 토큰 생성 (1시간 만료), 크롬 익스텐션의 경우 무기한.
      const accessToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: accessTokenExpiry },
      );

      // rememberMe에 따른 리프레시 토큰 만료 시간 설정
      const refreshTokenExpiry = rememberMe ? '7d' : '1h'; // 자동 로그인 시 7일, 그렇지 않으면 1시간

      // 리프레시 토큰 생성
      const refreshToken = this.jwtService.sign(
        { id: user.id, rememberMe },
        { expiresIn: refreshTokenExpiry },
      );

      // 리프레시 토큰을 쿠키에 저장
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // rememberMe에 따른 만료 시간 설정
        domain: cookieDomain,
      });

      return {
        ok: true,
        token: accessToken,
      };
    } catch (error) {
      const login_failed = this.i18n.t('error.login_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: login_failed };
    }
  }

  async refreshToken(
    refreshToken: string,
    @Res() res: Response,
    cookieDomain: string,
  ) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const result = await this.getUserProfile({ userId: decoded['id'] });

      if (!result.user) {
        const user_not_found = this.i18n.t('error.user_not_found', {
          lang: I18nContext.current().lang,
        });

        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          domain: cookieDomain,
        });

        return { ok: false, error: user_not_found };
      }

      const newAccessToken = this.jwtService.sign(
        { id: result.user.id },
        { expiresIn: '1h' },
      );

      await this.updateLastActive(result.user.id);
      await this.rewardLoginPoints(result.user.id);

      const rememberMe = decoded['rememberMe'];

      const refreshTokenExpiry = rememberMe ? '7d' : '1h'; // 자동 로그인 시 7일, 그렇지 않으면 1시간

      const newRefreshToken = this.jwtService.sign(
        { id: result.user.id, rememberMe },
        { expiresIn: refreshTokenExpiry },
      );

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // rememberMe에 따른 만료 시간 설정
        domain: cookieDomain,
      });

      return {
        ok: true,
        token: newAccessToken,
      };
    } catch (error) {
      const invalid_refresh_token = this.i18n.t('error.invalid_refresh_token', {
        lang: I18nContext.current().lang,
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        domain: cookieDomain,
      });

      return { ok: false, error: invalid_refresh_token };
    }
  }

  async logout(@Res() res: Response, cookieDomain: string) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        domain: cookieDomain,
      });

      return {
        ok: true,
      };
    } catch (error) {
      const logout_failed = this.i18n.t('error.logout_failed', {
        lang: I18nContext.current().lang,
      });

      return {
        ok: false,
        error: logout_failed,
      };
    }
  }

  async getUserProfile({
    userId,
  }: UserProfileInput): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({
        where: {
          id: userId,
        },
        relations: [],
      });

      if (!user) {
        throw new Error();
      }

      return {
        ok: true,
        user,
      };
    } catch (error) {
      const user_not_found = this.i18n.t('error.user_not_found');

      return {
        ok: false,
        error: user_not_found,
      };
    }
  }

  async editProfile(
    userId: number,
    { nickname, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({
        where: {
          id: userId,
        },
      });

      if (nickname) {
        user.nickname = nickname;
      }

      if (password) {
        user.password = password;
      }

      await this.users.save(user);

      return { ok: true };
    } catch (error) {
      const profile_update_failed = this.i18n.t('error.profile_update_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: profile_update_failed };
    }
  }

  async deleteAccount(
    { userId }: DeleteAccountInput,
    @Res() res: Response,
    cookieDomain: string,
  ): Promise<DeleteAccountOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });

      if (!user) {
        const user_not_found = this.i18n.t('error.user_not_found', {
          lang: I18nContext.current().lang,
        });

        return { ok: false, error: user_not_found };
      }

      await this.users.delete(userId);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        domain: cookieDomain,
      });

      return { ok: true };
    } catch (error) {
      const account_deletion_failed = this.i18n.t(
        'error.account_deletion_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return logErrorAndThrow(error, account_deletion_failed);
    }
  }

  async createAdminUser() {
    try {
      const ADMIN_EMAIL = 'admin@coddink.com';
      const adminExists = await this.users.findOne({
        where: { email: ADMIN_EMAIL },
      });

      if (adminExists) {
        return;
      }

      const newAdmin = this.users.create({
        email: ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        nickname: '관리자',
        role: UserRole.ADMIN,
      });

      await this.users.save(newAdmin);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '어드민 생성에 실패했습니다.' };
    }
  }

  async updateLastActive(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    await this.users.update(userId, { lastActive: new Date() });
    return { ok: true };
  }

  async rewardLoginPoints(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const lastLoginDate = user.lastLoginDate
      ? new Date(user.lastLoginDate)
      : null;

    // 오늘 날짜를 자정으로 설정
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // lastLoginDate가 오늘 날짜에 속하면 아무것도 하지 않음
    if (lastLoginDate && lastLoginDate >= today) {
      return { ok: true, point: user.point }; // 아무 작업도 하지 않고 현재 포인트 반환
    }

    await this.users.update(userId, {
      point: user.point + 10,
      lastLoginDate: now, // 오늘 날짜로 업데이트
    });

    return { ok: true, point: user.point };
  }

  async updateSubscriptionType(
    { subscriptionType, subscriptionPeriod }: UpdateSubscriptionTypeInput,
    userId: number,
  ): Promise<UpdateSubscriptionTypeOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // 현재 시간
      const currentDate = new Date();

      // 현재 premiumEndDate가 있는지 확인
      let premiumEndDate: Date;
      if (user.premiumEndDate && user.premiumEndDate > currentDate) {
        // 기존 premiumEndDate가 있는 경우, 해당 날짜를 기준으로 추가
        premiumEndDate = new Date(user.premiumEndDate);
      } else {
        // 기존 premiumEndDate가 없거나 만료된 경우, 현재 시간을 기준으로 추가
        premiumEndDate = new Date(currentDate);
      }

      // subscriptionPeriod에 따라 기간 추가
      switch (subscriptionPeriod) {
        case 'MONTHLY':
          premiumEndDate.setDate(premiumEndDate.getDate() + 30);
          break;
        case 'YEARLY':
          premiumEndDate.setFullYear(premiumEndDate.getFullYear() + 1);
          break;
        default:
          throw new Error('Invalid subscription period');
      }

      // 사용자 정보 업데이트
      await this.users.update(userId, {
        subscriptionType,
        premiumEndDate,
      });

      return { ok: true };
    } catch (error) {
      const account_status_change_failed = this.i18n.t(
        'error.account_status_change_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return logErrorAndThrow(error, account_status_change_failed);
    }
  }

  async updateUserPointsAndStatistics(
    { pointsToDeduct, taskType }: UpdateUserPointsAndStatisticsInput,
    userId: number,
  ): Promise<DecreaseUserPointsOutput> {
    try {
      // 현재 사용자 정보 가져오기
      const currentUser = await this.users.findOne({ where: { id: userId } });

      // 무료 구독자인 경우 포인트 감소
      if (currentUser.subscriptionType === SubscriptionType.FREE) {
        await this.decreaseUserPoints({ pointsToDeduct }, userId);
      }

      // 각 플랫폼별 통계 업데이트
      if (taskType === TaskType.THREADS_UNFOLLOW) {
        await this.updateThreadStatistics({
          userId,
          count: pointsToDeduct,
        });
      }

      if (taskType === TaskType.INSTAGRAM_UNFOLLOW) {
        await this.updateInstagramStatistics({
          userId,
          count: pointsToDeduct,
        });
      }

      if (taskType === TaskType.INSTAGRAM_AUTOMATION) {
        await this.updateInstagramAutomationStatistics({
          userId,
          count: pointsToDeduct,
        });
      }

      if (taskType === TaskType.NAVER_AUTOMATION) {
        await this.updateNaverAutomationStatistics({
          userId,
          count: pointsToDeduct,
        });
      }

      return { ok: true };
    } catch (error) {
      const points_decrease_and_statistics_update_failed = this.i18n.t(
        'error.points_decrease_and_statistics_update_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return logErrorAndThrow(
        error,
        points_decrease_and_statistics_update_failed,
      );
    }
  }

  async decreaseUserPoints(
    { pointsToDeduct }: DecreaseUserPointsInput,
    userId: number,
  ): Promise<DecreaseUserPointsOutput> {
    try {
      const currentUser = await this.users.findOne({ where: { id: userId } });
      await this.users.update(userId, {
        point: currentUser.point - pointsToDeduct,
      });

      return { ok: true };
    } catch (error) {
      const points_decrease_failed = this.i18n.t(
        'error.points_decrease_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      throw new Error(points_decrease_failed);
    }
  }

  async updateThreadStatistics({
    count,
    userId,
  }: UpdateStatisticsInput): Promise<UpdateStatisticsOutput> {
    try {
      const currentUser = await this.users.findOne({ where: { id: userId } });

      await this.users.update(userId, {
        threadsUnfollowCount: currentUser.threadsUnfollowCount + count,
      });

      return { ok: true };
    } catch (error) {
      const thread_unfollow_count_update_failed = this.i18n.t(
        'error.thread_unfollow_count_update_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      throw new Error(thread_unfollow_count_update_failed);
    }
  }

  async updateInstagramStatistics({
    count,
    userId,
  }: UpdateStatisticsInput): Promise<UpdateStatisticsOutput> {
    try {
      const currentUser = await this.users.findOne({ where: { id: userId } });

      await this.users.update(userId, {
        instagramUnfollowCount: currentUser.instagramUnfollowCount + count,
      });

      return { ok: true };
    } catch (error) {
      const instagram_automation_update_failed = this.i18n.t(
        'error.instagram_automation_update_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      throw new Error(instagram_automation_update_failed);
    }
  }

  async updateInstagramAutomationStatistics({
    count,
    userId,
  }: UpdateStatisticsInput): Promise<UpdateStatisticsOutput> {
    try {
      const currentUser = await this.users.findOne({ where: { id: userId } });

      await this.users.update(userId, {
        instagramAutomationCount: currentUser.instagramAutomationCount + count,
      });

      return { ok: true };
    } catch (error) {
      const instagram_automation_update_failed = this.i18n.t(
        'error.instagram_automation_update_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      throw new Error(instagram_automation_update_failed);
    }
  }

  async updateNaverAutomationStatistics({
    count,
    userId,
  }: UpdateStatisticsInput): Promise<UpdateStatisticsOutput> {
    try {
      const currentUser = await this.users.findOne({ where: { id: userId } });

      await this.users.update(userId, {
        naverAutomationCount: currentUser.naverAutomationCount + count,
      });

      return { ok: true };
    } catch (error) {
      const naver_automation_update_failed = this.i18n.t(
        'error.naver_automation_update_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      throw new Error(naver_automation_update_failed);
    }
  }

  async getUserList(): Promise<GetUserListOutput> {
    try {
      const userList = await this.users.find();

      if (!userList) {
        throw new Error();
      }

      return {
        ok: true,
        userList,
      };
    } catch (error) {
      const user_not_found = this.i18n.t('error.user_not_found', {
        lang: I18nContext.current().lang,
      });

      return {
        ok: false,
        error: user_not_found,
      };
    }
  }

  async editUserSubscriptionType({
    userId,
    subscriptionType,
  }: EditUserSubscriptionTypeInput): Promise<EditUserSubscriptionTypeOutput> {
    try {
      const user = await this.users.findOne({
        where: {
          id: userId,
        },
      });

      if (subscriptionType === SubscriptionType.FREE) {
        user.subscriptionType = SubscriptionType.FREE;
        user.premiumEndDate = null;
      }

      if (subscriptionType === SubscriptionType.PREMIUM) {
        this.updateSubscriptionType(
          {
            subscriptionPeriod: 'MONTHLY',
            subscriptionType: SubscriptionType.PREMIUM,
          },
          userId,
        );
        return { ok: true };
      }

      await this.users.save(user);

      return { ok: true };
    } catch (error) {
      const profile_update_failed = this.i18n.t('error.profile_update_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: profile_update_failed };
    }
  }
}
