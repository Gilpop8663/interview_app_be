import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
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
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly i18n: I18nService,
  ) {}

  // 모든 상품 조회
  async getProductList(): Promise<GetProductListOutput> {
    try {
      const productList = await this.products.find();

      return { ok: true, productList };
    } catch (error) {
      const product_list_query_failed = this.i18n.t(
        'error.product_list_query_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: product_list_query_failed };
    }
  }

  // 단일 상품 조회
  async getProductDetail({
    productId,
  }: GetProductDetailInput): Promise<GetProductDetailOutput> {
    try {
      const product = await this.products.findOne({ where: { id: productId } });

      return { ok: true, product };
    } catch (error) {
      const product_query_failed = this.i18n.t('error.product_query_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: product_query_failed };
    }
  }

  // 상품 생성
  async createProduct({
    description,
    name,
    price,
  }: CreateProductInput): Promise<CreateProductOutput> {
    try {
      const product = this.products.create({
        name,
        price,
        description,
      });

      const result = await this.products.save(product);

      return { ok: true, productId: result.id };
    } catch (error) {
      const product_creation_failed = this.i18n.t(
        'error.product_creation_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: product_creation_failed };
    }
  }

  // 상품 수정
  async editProduct({
    productId,
    description,
    name,
    price,
  }: EditProductInput): Promise<EditProductOutput> {
    try {
      const product = await this.products.findOne({
        where: {
          id: productId,
        },
      });

      if (name) {
        product.name = name;
      }

      if (price) {
        product.price = price;
      }

      if (description) {
        product.description = description;
      }

      await this.products.save(product);

      return { ok: true };
    } catch (error) {
      const product_update_failed = this.i18n.t('error.product_update_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: product_update_failed };
    }
  }

  // 상품 삭제
  async deleteProduct({
    productId,
  }: DeleteProductInput): Promise<DeleteProductOutput> {
    try {
      await this.products.delete(productId);

      return { ok: true };
    } catch (error) {
      const product_deletion_failed = this.i18n.t(
        'error.product_deletion_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: product_deletion_failed };
    }
  }
}
