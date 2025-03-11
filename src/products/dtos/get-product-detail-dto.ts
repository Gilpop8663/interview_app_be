import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Product } from '../entities/product.entity';

@InputType()
export class GetProductDetailInput {
  @Field(() => Number)
  productId: number;
}

@ObjectType()
export class GetProductDetailOutput extends CoreOutput {
  @Field(() => Product, { nullable: true })
  product?: Product;
}
