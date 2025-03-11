import * as request from 'supertest';
import { app, productsRepository } from './jest.setup';

const GRAPHQL_ENDPOINT = '/graphql';

const TEST_PRODUCT = {
  name: 'Test Product',
  description: 'This is a test product.',
  price: 10000,
};

describe('ProductController (e2e)', () => {
  beforeAll(async () => {
    // 초기 상품 생성
    await productsRepository.save([
      {
        name: 'Product 1',
        description: 'Description 1',
        price: 5000,
      },
      {
        name: 'Product 2',
        description: 'Description 2',
        price: 15000,
      },
    ]);
  });

  describe('상품 생성', () => {
    test('상품을 생성한다.', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              createProduct(
                input: { name: "${TEST_PRODUCT.name}", description: "${TEST_PRODUCT.description}", price: ${TEST_PRODUCT.price} }
              ) {
                ok
                error
                productId
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createProduct },
            },
          } = res;

          expect(createProduct.ok).toBe(true);
          expect(createProduct.error).toBe(null);
          expect(createProduct.productId).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('상품 조회', () => {
    test('상품을 조회한다.', async () => {
      const product = await productsRepository.findOne({
        where: { name: TEST_PRODUCT.name },
      });

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            query {
              getProductDetail(input: { productId: ${product.id}}
              ) {
                ok
                error
                product {
                  id
                  name
                  description
                  price
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { getProductDetail },
            },
          } = res;

          expect(getProductDetail.ok).toBe(true);
          expect(getProductDetail.error).toBe(null);
          expect(getProductDetail.product).toMatchObject({
            id: product.id,
            name: TEST_PRODUCT.name,
            description: TEST_PRODUCT.description,
            price: TEST_PRODUCT.price,
          });
        });
    });
  });

  describe('상품 수정', () => {
    test('상품을 수정한다.', async () => {
      const [product] = await productsRepository.find();

      const updatedProductInfo = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 20000,
      };

      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              editProduct(
                input: { productId: ${product.id}, name: "${updatedProductInfo.name}", description: "${updatedProductInfo.description}", price: ${updatedProductInfo.price} }
              ) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { editProduct },
            },
          } = res;

          expect(editProduct.ok).toBe(true);
          expect(editProduct.error).toBe(null);
        });

      const updatedProduct = await productsRepository.findOne({
        where: { id: product.id },
      });

      expect(updatedProduct).toMatchObject(updatedProduct);
    });
  });

  describe('상품 삭제', () => {
    test('상품을 삭제한다.', async () => {
      const [product] = await productsRepository.find();

      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              deleteProduct(input: { productId: ${product.id}}) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { deleteProduct },
            },
          } = res;

          expect(deleteProduct.ok).toBe(true);
          expect(deleteProduct.error).toBe(null);
        });

      const deletedProduct = await productsRepository.findOne({
        where: { id: product.id },
      });

      expect(deletedProduct).toBeNull();
    });
  });
});
