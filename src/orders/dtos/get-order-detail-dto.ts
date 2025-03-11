import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderDetailInput {
  @Field(() => Number)
  orderId: number;
}

@ObjectType()
export class GetOrderDetailOutput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
