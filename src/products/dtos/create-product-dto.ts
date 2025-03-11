import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Product } from '../entities/product.entity';

@InputType()
export class CreateProductInput extends PickType(Product, [
  'name',
  'description',
  'price',
]) {}

@ObjectType()
export class CreateProductOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  productId?: number;
}
