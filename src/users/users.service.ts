import { Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
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
import { logErrorAndThrow } from 'src/utils';
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
import { Verification } from './entities/verification.entity';
import {
  SendVerifyEmailInput,
  SendVerifyEmailOutput,
} from './dtos/send-verify-email.dto';
import { MailService } from 'src/mail/mail.service';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import {
  CheckNicknameInput,
  CheckNicknameOutput,
} from './dtos/check-nickname.dto';
import {
  ResetPasswordInput,
  ResetPasswordOutput,
} from './dtos/reset-password.dto';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
} from './dtos/forgot-password.dto';
import { PasswordResetToken } from './entities/passwordResetToken.entity';
import { RefreshTokenOutput } from './dtos/refresh-token.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetToken: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    nickname,
  }: CreateAccountInput): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      const existNickname = await this.users.findOne({ where: { nickname } });
      const existEmail = await this.users.findOne({ where: { email } });
      const verification = await this.verifications.findOne({
        where: { email },
      });

      if (existNickname) {
        return { ok: false, error: '이미 존재하는 닉네임입니다.' };
      }

      if (existEmail) {
        return { ok: false, error: '이미 존재하는 이메일입니다.' };
      }

      if (!verification.verified) {
        return { ok: false, error: '이메일 인증을 받아주세요.' };
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

      const result = await this.login({ email, password, rememberMe: true });

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

  async login({ email, password, rememberMe }: LoginInput) {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['password', 'id'],
      });

      if (!user) {
        return {
          ok: false,
          error: '입력한 아이디가 존재하지 않습니다.',
        };
      }

      const isPasswordCorrect = await user.checkPassword(password);
      if (!isPasswordCorrect) {
        return {
          ok: false,
          error: '비밀번호가 맞지 않습니다.',
        };
      }

      await this.updateLastActive(user.id);
      await this.rewardLoginPoints(user.id);

      // // 액세스 토큰 생성 (1시간 만료)
      const accessToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '1h' },
      );

      // rememberMe에 따른 리프레시 토큰 만료 시간 설정
      const refreshTokenExpiry = rememberMe ? '7d' : '1h'; // 자동 로그인 시 7일, 그렇지 않으면 1시간

      // 리프레시 토큰 생성
      const refreshToken = this.jwtService.sign(
        { id: user.id, rememberMe },
        { expiresIn: refreshTokenExpiry },
      );

      return {
        ok: true,
        token: accessToken,
        refreshToken,
      };
    } catch (error) {
      return { ok: false, error: '로그인에 실패했습니다.' };
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenOutput> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const result = await this.getUserProfile({ userId: decoded['id'] });

      if (!result.user) {
        const user_not_found = this.i18n.t('error.user_not_found', {
          lang: I18nContext.current().lang,
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

      return {
        ok: true,
        token: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      const invalid_refresh_token = this.i18n.t('error.invalid_refresh_token', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: invalid_refresh_token };
    }
  }

  async sendVerifyEmail({
    email,
  }: SendVerifyEmailInput): Promise<SendVerifyEmailOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });

      if (user) {
        return {
          ok: false,
          error: '이미 해당 이메일로 가입된 계정이 있습니다.',
        };
      }

      const existVerification = await this.verifications.findOne({
        where: { email },
      });

      if (existVerification) {
        await this.verifications.delete(existVerification.id);
      }

      const verification = this.verifications.create({ email });

      await this.verifications.save(verification);

      this.mailService.sendVerificationEmail({
        email: email,
        code: verification.code,
      });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '이메일 인증 메일 보내기에 실패했습니다.',
      };
    }
  }

  async verifyEmail({
    code,
    email,
  }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { email },
      });

      if (!verification) {
        return { ok: false, error: '이메일 인증 정보가 없습니다.' };
      }

      const now = new Date();

      if (verification.expiresAt < now) {
        await this.verifications.delete(verification.id);
        return { ok: false, error: '인증 코드가 만료되었습니다.' };
      }

      if (verification.code === code) {
        await this.verifications.update(verification.id, { verified: true });

        return { ok: true };
      }

      await this.verifications.update(verification.id, {
        attempts: verification.attempts + 1,
      });

      if (verification.attempts + 1 >= 3) {
        await this.verifications.delete(verification.id);
        return {
          ok: false,
          error: '인증 코드가 3회 틀려서 삭제되었습니다. 다시 요청해주세요.',
        };
      }

      return { ok: false, error: '이메일 검증에 실패했습니다.' };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async checkNickname({
    nickname,
  }: CheckNicknameInput): Promise<CheckNicknameOutput> {
    try {
      // 닉네임 유효성 검사: 영문, 한글, 숫자만 허용하며, 길이는 2~64자
      const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,64}$/;

      if (!nicknameRegex.test(nickname)) {
        return {
          ok: false,
          error:
            '닉네임은 영문, 한글, 숫자로 구성된 2자리 이상 64자리 이하여야 합니다.',
        };
      }

      const user = await this.users.findOne({ where: { nickname } });

      if (user) {
        return { ok: false, error: '이미 사용 중인 닉네임입니다.' };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '닉네임 중복 확인에 실패했습니다.' };
    }
  }

  async forgotPassword({
    email,
  }: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    try {
      const user = await this.users.findOne({ where: { email } });

      if (!user) {
        return { ok: false, error: '유저가 존재하지 않습니다.' };
      }

      const token = this.passwordResetToken.create({ user });

      await this.passwordResetToken.save(token);

      this.mailService.sendResetPasswordEmail({
        email: user.email,
        nickname: user.nickname,
        code: token.code,
      });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '비밀번호 재설정 이메일 전송에 실패했습니다.',
      };
    }
  }

  async resetPassword({
    password,
    code,
  }: ResetPasswordInput): Promise<ResetPasswordOutput> {
    try {
      const token = await this.passwordResetToken.findOne({
        where: { code, expiresAt: MoreThan(new Date()) },
        relations: ['user'],
      });

      if (!token) {
        return { ok: false, error: '토큰이 존재하지 않습니다.' };
      }

      const user = token.user;

      user.password = password;

      await this.users.save(user);
      await this.passwordResetToken.delete(token.id);

      return { ok: true };
    } catch (error) {
      return { ok: false, error: '비밀번호 재설정에 실패했습니다.' };
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
      if (taskType === TaskType.ANSWER_SUBMITTED) {
        await this.updateSubmitStatistics({
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

  async updateSubmitStatistics({
    count,
    userId,
  }: UpdateStatisticsInput): Promise<UpdateStatisticsOutput> {
    try {
      const currentUser = await this.users.findOne({ where: { id: userId } });

      await this.users.update(userId, {
        answerSubmittedCount: currentUser.answerSubmittedCount + count,
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
