import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class UpdateStatisticsInput {
  @Field(() => Number)
  count: number;

  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class UpdateStatisticsOutput extends CoreOutput {}
