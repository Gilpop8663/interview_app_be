import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { GetProductListOutput } from './dtos/get-product-list-dto';
import {
  GetProductDetailInput,
  GetProductDetailOutput,
} from './dtos/get-product-detail-dto';
import {
  CreateProductInput,
  CreateProductOutput,
} from './dtos/create-product-dto';
import { EditProductInput, EditProductOutput } from './dtos/edit-product-dto';
import {
  DeleteProductInput,
  DeleteProductOutput,
} from './dtos/delete-product-dto';
import { AdminGuard } from 'src/admin/admin.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productService: ProductsService) {}

  // 모든 상품 조회
  @Query(() => GetProductListOutput)
  async getProductList() {
    return this.productService.getProductList();
  }

  // 단일 상품 조회
  @Query(() => GetProductDetailOutput)
  async getProductDetail(@Args('input') input: GetProductDetailInput) {
    return this.productService.getProductDetail(input);
  }

  // 상품 생성
  @Mutation(() => CreateProductOutput)
  @UseGuards(AdminGuard)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productService.createProduct(input);
  }

  // 상품 수정
  @Mutation(() => EditProductOutput)
  @UseGuards(AdminGuard)
  async editProduct(@Args('input') input: EditProductInput) {
    return this.productService.editProduct(input);
  }

  // 상품 삭제
  @Mutation(() => DeleteProductOutput)
  @UseGuards(AdminGuard)
  async deleteProduct(@Args('input') input: DeleteProductInput) {
    return this.productService.deleteProduct(input);
  }
}
