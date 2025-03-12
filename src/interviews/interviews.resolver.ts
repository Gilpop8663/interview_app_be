import { Resolver } from '@nestjs/graphql';
import { InterviewsService } from './interviews.service';

@Resolver()
export class InterviewsResolver {
  constructor(private readonly interviewsService: InterviewsService) {}
}
