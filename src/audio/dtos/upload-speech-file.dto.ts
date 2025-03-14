import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class UploadSpeechFileInput {
  @Field(() => String) // Base64로 파일을 받음
  file: string;
}

@ObjectType()
export class UploadSpeechFileOutput extends CoreOutput {
  @Field(() => Number)
  audioId: number;

  @Field(() => String)
  answer: string;

  @Field(() => String)
  habits: string;

  @Field(() => String)
  speed: string;
}
