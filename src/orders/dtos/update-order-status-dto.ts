import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class UpdateOrderStatusInput extends PickType(Order, ['status']) {
  @Field(() => Number)
  orderId: number;
}

@ObjectType()
export class UpdateOrderStatusOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
