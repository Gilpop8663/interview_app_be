import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType({ isAbstract: true })
@ObjectType()
export class InterviewQuestion {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  question: string;
}
