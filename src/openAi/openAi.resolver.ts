import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OpenAiService } from './openAi.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  GenerateChatInput,
  GenerateChatOutput,
} from './dtos/generate-chat.dto';
import {
  GenerateInterviewQuestionInput,
  GenerateInterviewQuestionOutput,
} from './dtos/generate-interview-question.dto';
import {
  GenerateInterviewFeedbackInput,
  GenerateInterviewFeedbackOutput,
} from './dtos/genertate-interview-feedback.dto';

@Resolver()
export class OpenAiResolver {
  constructor(private readonly openAiService: OpenAiService) {}

  @Mutation(() => GenerateChatOutput)
  @UseGuards(AuthGuard)
  async generateChat(@Args('input') input: GenerateChatInput) {
    return this.openAiService.generateChatGemini(input);
  }

  @Mutation(() => GenerateInterviewQuestionOutput) // 새로운 인터뷰 질문 생성 Mutation 추가
  async generateInterviewQuestion(
    @Args('input') input: GenerateInterviewQuestionInput,
  ) {
    return this.openAiService.generateInterviewGeminiQuestion(input); // 해당 서비스 메서드 호출
  }

  @Mutation(() => GenerateInterviewFeedbackOutput)
  async generateInterviewFeedback(
    @Args('input') input: GenerateInterviewFeedbackInput,
  ) {
    return this.openAiService.generateInterviewFeedback(input);
  }
}
