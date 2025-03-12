import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class UploadSpeechFileInput {
  @Field(() => String) // Base64로 파일을 받음
  file: string;
}

@ObjectType()
export class UploadSpeechFileOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  feedback: string;
}
