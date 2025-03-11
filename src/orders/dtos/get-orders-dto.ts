import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderListInput {
  @Field(() => Number)
  orderId: number;
}

@ObjectType()
export class GetOrderListOutput extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  orderList?: Order[];
}
