import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { TaskType } from '../entities/user.entity';

@InputType()
export class UpdateUserPointsAndStatisticsInput {
  @Field(() => Number)
  pointsToDeduct: number;

  @Field(() => TaskType)
  taskType: TaskType; // 변수명을 platform으로 변경
}

@ObjectType()
export class UpdateUserPointsAndStatisticsOutput extends CoreOutput {}
