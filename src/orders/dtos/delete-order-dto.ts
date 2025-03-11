import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteOrderInput {
  @Field(() => Number)
  orderId: number;
}

@ObjectType()
export class DeleteOrderOutput extends CoreOutput {}
