import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';

import {
  DeleteAccountInput,
  DeleteAccountOutput,
} from './dtos/delete-account.dto';

import { Request, Response } from 'express';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CheckEmailInput, CheckEmailOutput } from './dtos/check-email.dto';
import { getCookieDomain } from './constant';
import {
  UpdateSubscriptionTypeInput,
  UpdateSubscriptionTypeOutput,
} from './dtos/update-subscription-type.dto';
import {
  UpdateUserPointsAndStatisticsInput,
  UpdateUserPointsAndStatisticsOutput,
} from './dtos/update-user-points-and-statistics.dto';
import { AdminGuard } from 'src/admin/admin.guard';
import { GetUserListOutput } from './dtos/get-user-list.dto';
import {
  EditUserSubscriptionTypeInput,
  EditUserSubscriptionTypeOutput,
} from './dtos/edit-user-subscription-type.dto';
import {
  SendVerifyEmailInput,
  SendVerifyEmailOutput,
} from './dtos/send-verify-email.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import {
  CheckNicknameInput,
  CheckNicknameOutput,
} from './dtos/check-nickname.dto';
import {
  ForgotPasswordInput,
  ForgotPasswordOutput,
} from './dtos/forgot-password.dto';
import {
  ResetPasswordInput,
  ResetPasswordOutput,
} from './dtos/reset-password.dto';
import { RefreshTokenInput } from './dtos/refresh-token.dto';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
    @Context('res') res: Response,
    @Context('req') req: Request,
  ) {
    const cookieDomain = getCookieDomain(req.headers.referer);

    return this.usersService.createAccount(
      createAccountInput,
      res,
      cookieDomain,
    );
  }

  @Mutation(() => LoginOutput)
  login(
    @Args('input') loginInput: LoginInput,
    @Context('res') res: Response,
    @Context('req') req: Request,
  ) {
    const cookieDomain = getCookieDomain(req.headers.referer);

    return this.usersService.login(loginInput, res, cookieDomain);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() user: User) {
    return user;
  }

  @Mutation(() => SendVerifyEmailOutput)
  sendVerifyEmail(@Args('input') { email }: SendVerifyEmailInput) {
    return this.usersService.sendVerifyEmail({ email });
  }

  @Mutation(() => VerifyEmailOutput)
  verifyEmail(@Args('input') input: VerifyEmailInput) {
    return this.usersService.verifyEmail(input);
  }

  @Mutation(() => CheckNicknameOutput)
  checkNickname(@Args('input') input: CheckNicknameInput) {
    return this.usersService.checkNickname(input);
  }

  @Mutation(() => ForgotPasswordOutput)
  forgotPassword(@Args('input') input: ForgotPasswordInput) {
    return this.usersService.forgotPassword(input);
  }

  @Mutation(() => ResetPasswordOutput)
  resetPassword(@Args('input') input: ResetPasswordInput) {
    return this.usersService.resetPassword(input);
  }

  @Query(() => UserProfileOutput)
  @UseGuards(AuthGuard)
  getUserProfile(@Args('input') userProfileInput: UserProfileInput) {
    return this.usersService.getUserProfile(userProfileInput);
  }

  @Query(() => GetUserListOutput)
  @UseGuards(AdminGuard)
  getUserList() {
    return this.usersService.getUserList();
  }

  @Mutation(() => EditProfileOutput)
  @UseGuards(AuthGuard)
  editProfile(
    @AuthUser() user: User,
    @Args('input') editProfileInput: EditProfileInput,
  ) {
    return this.usersService.editProfile(user.id, editProfileInput);
  }

  @Mutation(() => DeleteAccountOutput)
  deleteAccount(
    @Args('input') input: DeleteAccountInput,
    @Context('res') res: Response,
    @Context('req') req: Request,
  ) {
    const cookieDomain = getCookieDomain(req.headers.referer);

    return this.usersService.deleteAccount(input, res, cookieDomain);
  }

  @Mutation(() => LoginOutput)
  refreshToken(
    @Args('input') input: RefreshTokenInput,
    @Context('res') res: Response,
    @Context('req') req: Request,
  ) {
    const refreshToken = input.refreshToken;
    const cookieDomain = getCookieDomain(req.headers.referer);

    if (!refreshToken) {
      return { ok: false, error: '리프레시 토큰이 없습니다.' };
    }

    return this.usersService.refreshToken(refreshToken, res, cookieDomain);
  }

  @Mutation(() => CoreOutput)
  logout(@Context('res') res: Response, @Context('req') req: Request) {
    const cookieDomain = getCookieDomain(req.headers.referer);

    return this.usersService.logout(res, cookieDomain);
  }

  @Mutation(() => CheckEmailOutput)
  checkEmail(@Args('input') input: CheckEmailInput) {
    return this.usersService.checkEmail(input);
  }

  @Mutation(() => UpdateSubscriptionTypeOutput)
  @UseGuards(AuthGuard)
  updateSubscriptionType(
    @Args('input') input: UpdateSubscriptionTypeInput,
    @AuthUser() user: User,
  ) {
    return this.usersService.updateSubscriptionType(input, user.id);
  }

  @Mutation(() => UpdateUserPointsAndStatisticsOutput)
  @UseGuards(AuthGuard)
  updateUserPointsAndStatistics(
    @Args('input') input: UpdateUserPointsAndStatisticsInput,
    @AuthUser() user: User,
  ) {
    return this.usersService.updateUserPointsAndStatistics(input, user.id);
  }

  @Mutation(() => EditUserSubscriptionTypeOutput)
  @UseGuards(AdminGuard)
  editUserSubscriptionType(
    @Args('input') input: EditUserSubscriptionTypeInput,
  ) {
    return this.usersService.editUserSubscriptionType(input);
  }
}
