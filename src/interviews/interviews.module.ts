import { Module } from '@nestjs/common';
import { InterviewsResolver } from './interviews.resolver';
import { InterviewsService } from './interviews.service';

@Module({
  imports: [],
  providers: [InterviewsResolver, InterviewsService],
})
export class InterviewsModule {}
