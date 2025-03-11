import * as request from 'supertest';
import {
  app,
  usersRepository,
  productsRepository,
  ordersRepository,
} from './jest.setup';
import { OrderStatus } from 'src/orders/entities/order.entity';

const GRAPHQL_ENDPOINT = '/graphql';

const TEST_USER = {
  id: 1, // 테스트할 사용자 ID (사전에 생성된 사용자)
};

const TEST_PRODUCT = {
  id: 1, // 테스트할 상품 ID (사전에 생성된 상품)
};

const TEST_ORDER = {
  totalAmount: 10000,
  status: OrderStatus.PENDING, // 초기 상태
};

describe('OrderController (e2e)', () => {
  beforeAll(async () => {
    // 초기 사용자 및 상품 생성 (사전에 필요)
    await usersRepository.save({
      id: TEST_USER.id,
      email: 'testuser@example.com',
      password: 'password',
    });

    await productsRepository.save({
      id: TEST_PRODUCT.id,
      name: 'Test Product',
      description: 'This is a test product.',
      price: 10000,
    });
  });

  describe('주문 생성', () => {
    test('주문을 생성한다.', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              createOrder(
                input: {
                  productId: ${TEST_PRODUCT.id},
                  totalAmount: ${TEST_ORDER.totalAmount},
                }
              ) {
                ok
                error
                orderId
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createOrder },
            },
          } = res;

          expect(createOrder.ok).toBe(true);
          expect(createOrder.error).toBe(null);
          expect(createOrder.orderId).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('주문 조회', () => {
    test('주문을 조회한다.', async () => {
      const order = await ordersRepository.findOne({
        where: { product: { id: TEST_PRODUCT.id } },
      });

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            query {
              getOrderDetail(input: { orderId: ${order.id} }) {
                ok
                error
                order {
                  id
                  totalAmount
                  status
                  user {
                    id
                    email
                  }
                  product {
                    id
                    name
                    price
                  }
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { getOrderDetail },
            },
          } = res;

          expect(getOrderDetail.ok).toBe(true);
          expect(getOrderDetail.error).toBe(null);
          expect(getOrderDetail.order).toMatchObject({
            id: order.id,
            totalAmount: TEST_ORDER.totalAmount,
            status: 'PENDING',
            product: { id: TEST_PRODUCT.id, name: 'Test Product' },
          });
        });
    });
  });

  describe('주문 수정', () => {
    test('주문을 수정한다.', async () => {
      const order = await ordersRepository.findOne({
        where: { product: { id: TEST_PRODUCT.id } },
      });

      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              updateOrderStatus(
                input: { orderId: ${order.id}, status: COMPLETED }
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
              data: { updateOrderStatus },
            },
          } = res;

          expect(updateOrderStatus.ok).toBe(true);
          expect(updateOrderStatus.error).toBe(null);
        });

      const updatedOrder = await ordersRepository.findOne({
        where: { id: order.id },
      });
      expect(updatedOrder.status).toBe(OrderStatus.COMPLETED);
    });
  });

  describe('주문 삭제', () => {
    test('주문을 삭제한다.', async () => {
      const order = await ordersRepository.findOne({
        where: { product: { id: TEST_PRODUCT.id } },
      });

      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              deleteOrder(input: { orderId: ${order.id} }) {
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
              data: { deleteOrder },
            },
          } = res;

          expect(deleteOrder.ok).toBe(true);
          expect(deleteOrder.error).toBe(null);
        });

      const deletedOrder = await ordersRepository.findOne({
        where: { id: order.id },
      });
      expect(deletedOrder).toBeNull();
    });
  });
});
