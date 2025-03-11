import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteProductInput {
  @Field(() => Number)
  productId: number;
}

@ObjectType()
export class DeleteProductOutput extends CoreOutput {}
