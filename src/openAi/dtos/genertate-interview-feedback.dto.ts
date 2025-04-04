import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GenerateInterviewFeedbackInput {
  @Field(() => String)
  userAnswer: string; // 사용자가 제출한 답변

  @Field(() => String)
  question: string; // 인터뷰 질문
}

@ObjectType()
export class GenerateInterviewFeedbackOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  feedback?: string; // 생성된 피드백
}
