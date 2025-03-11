import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DecreaseUserPointsInput {
  @Field(() => Number)
  pointsToDeduct: number;
}

@ObjectType()
export class DecreaseUserPointsOutput extends CoreOutput {}
