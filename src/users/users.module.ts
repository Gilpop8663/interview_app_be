import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { Verification } from './entities/verification.entity';
import { PasswordResetToken } from './entities/passwordResetToken.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification, PasswordResetToken]),
    ScheduleModule.forRoot(),
  ],
  providers: [UsersService, UsersResolver, CronService],
  exports: [UsersService],
})
export class UsersModule {}
