import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { CheckUnfollowOutput } from './dtos/check-unfollow.dto';

const mockUserRepository = {
  findOne: jest.fn(), // 필요한 메서드만 모의 구현
  // 필요한 다른 메서드도 추가할 수 있습니다.
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        }, // UserRepository 모의 제공
        { provide: JwtService, useValue: {} }, // JwtService 모의 제공 (필요에 따라)
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 추가적인 테스트 케이스를 작성할 수 있습니다.

  it('should check unfollow', async () => {
    const result: CheckUnfollowOutput = await service.checkUnFollow({
      username: 'username',
      password: 'password',
    });

    // 결과가 원하는 객체 구조를 갖고 있는지 확인
    expect(result).toHaveProperty('unfollowerList');

    // 'unfollowers'의 값이 배열인지 확인
    expect(result.unfollowerList).toEqual(expect.any(Array));

    // 추가 assertions
  }, 10000);
});
