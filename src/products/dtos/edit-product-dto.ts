import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Product } from '../entities/product.entity';

@ObjectType()
export class EditProductOutput extends CoreOutput {}

@InputType()
export class EditProductInput extends PartialType(
  PickType(Product, ['name', 'description', 'price']),
) {
  @Field(() => Number)
  productId: number;
}
