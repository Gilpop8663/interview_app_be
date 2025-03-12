import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsResolver } from './interviews.resolver';

describe('InterviewsResolver', () => {
  let resolver: InterviewsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterviewsResolver],
    }).compile();

    resolver = module.get<InterviewsResolver>(InterviewsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
