import { Test, TestingModule } from '@nestjs/testing';
import { CouponResolver } from './coupon.resolver';

describe('CouponResolver', () => {
  let resolver: CouponResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponResolver],
    }).compile();

    resolver = module.get<CouponResolver>(CouponResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
