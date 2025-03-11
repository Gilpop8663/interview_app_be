import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionType, User } from 'src/users/entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>, // 레포지토리 주입
  ) {}

  @Cron('0 0 * * *') // 매일 자정에 실행 (예: 0 0 * * *)
  async handleCron() {
    const currentDate = new Date();
    const users = await this.users.find({
      where: {
        subscriptionType: SubscriptionType.PREMIUM,
        premiumEndDate: Not(IsNull()), // null이 아닌 만료일을 가진 사용자만 가져오기
      },
    });

    for (const user of users) {
      if (
        user.subscriptionType === SubscriptionType.PREMIUM &&
        user.premiumEndDate < currentDate
      ) {
        user.subscriptionType = SubscriptionType.FREE; // 일반 계정으로 변경
        await this.users.save(user); // 변경 사항 저장
      }
    }
  }
}
