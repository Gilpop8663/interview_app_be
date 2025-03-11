import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GenerateInterviewQuestionInput {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  jobTitle: string;

  @Field(() => Number)
  yearsOfExperience: number;

  @Field(() => String)
  preferredLanguage: string;
}

@ObjectType()
export class GenerateInterviewQuestionOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  question?: string;
}
