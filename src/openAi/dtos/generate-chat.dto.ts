import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GenerateChatInput {
  @Field(() => String)
  message: string;
}

@ObjectType()
export class GenerateChatOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  message?: string;
}
