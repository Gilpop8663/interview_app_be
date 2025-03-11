import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, [
  'totalAmount',
  'currency',
]) {
  @Field(() => Number)
  productId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  orderId?: number;
}
