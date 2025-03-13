import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InterviewsService } from './interviews.service';
import {
  ProcessInterviewAudioInput,
  ProcessInterviewAudioOutput,
} from './dtos/process-interview-audio.dto';
import { InterviewQuestion } from './entitis/interviewQuestion.entity';

@Resolver()
export class InterviewsResolver {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Query(() => [InterviewQuestion])
  async getInterviewQuestions() {
    return this.interviewsService.getInterviewQuestions();
  }

  @Mutation(() => ProcessInterviewAudioOutput)
  async processInterviewAudio(
    @Args('input') input: ProcessInterviewAudioInput,
  ) {
    return this.interviewsService.processInterviewAudio(input);
  }
}
