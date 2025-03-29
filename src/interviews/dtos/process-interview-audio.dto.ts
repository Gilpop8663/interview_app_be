import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class ProcessInterviewAudioInput {
  @Field(() => String)
  file: string;

  @Field(() => String)
  question: string;
}

@ObjectType()
export class ProcessInterviewAudioOutput extends CoreOutput {
  @Field(() => String)
  feedback: string;
}
