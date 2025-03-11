import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Product } from '../entities/product.entity';

@InputType()
export class GetProductListInput {
  @Field(() => Number)
  productId: number;
}

@ObjectType()
export class GetProductListOutput extends CoreOutput {
  @Field(() => [Product], { nullable: true })
  productList?: Product[];
}
