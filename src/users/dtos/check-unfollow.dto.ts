import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CheckUnfollowInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
export class CheckUnfollowOutput extends CoreOutput {
  @Field(() => [String], {
    nullable: true,
  })
  unfollowerList?: string[];
}
