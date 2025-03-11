import * as request from 'supertest';
import {
  app,
  usersRepository,
  productsRepository,
  ordersRepository,
  paymentsRepository,
} from './jest.setup';
import { OrderStatus } from 'src/orders/entities/order.entity';
import { PaymentStatus } from 'src/payments/entities/payment.entity';

const GRAPHQL_ENDPOINT = '/graphql';

const TEST_USER = {
  id: 1, // 테스트할 사용자 ID (사전에 생성된 사용자)
};

const TEST_PRODUCT = {
  id: 1, // 테스트할 상품 ID (사전에 생성된 상품)
};

const TEST_ORDER = {
  totalAmount: 10000,
  status: OrderStatus.PENDING,
};

const TEST_PAYMENT = {
  amount: 10000,
  transactionId: 'test-transaction-id',
  status: 'PENDING',
};

describe('PaymentController (e2e)', () => {
  let orderId: number;

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

    // 주문 생성
    const order = await ordersRepository.save({
      user: { id: TEST_USER.id },
      product: { id: TEST_PRODUCT.id },
      totalAmount: TEST_ORDER.totalAmount,
      status: TEST_ORDER.status,
    });

    orderId = order.id;
  });

  describe('결제 생성', () => {
    test('결제를 생성한다.', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              createPayment(
                input: {
                  orderId: ${orderId},
                  amount: ${TEST_PAYMENT.amount},
                }
              ) {
                ok
                error
                paymentId
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { createPayment },
            },
          } = res;

          expect(createPayment.ok).toBe(true);
          expect(createPayment.error).toBe(null);
          expect(createPayment.paymentId).toBeGreaterThanOrEqual(1);
        });
    });
  });

  describe('결제 상세 조회', () => {
    test('결제를 조회한다.', async () => {
      const [payment] = await paymentsRepository.find();

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            query {
              getPaymentDetail(input: { paymentId: ${payment.id} }) {
                ok
                error
                payment {
                  id
                  amount
                  status
                  transactionId
                  order {
                    id
                    totalAmount
                    status
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
              data: { getPaymentDetail },
            },
          } = res;

          expect(getPaymentDetail.ok).toBe(true);
          expect(getPaymentDetail.error).toBe(null);
          expect(getPaymentDetail.payment).toMatchObject({
            id: payment.id,
            amount: TEST_PAYMENT.amount,
            transactionId: null,
            status: TEST_PAYMENT.status, // 초기 상태 확인
            order: { id: orderId, totalAmount: TEST_ORDER.totalAmount },
          });
        });
    });
  });

  describe('결제 상태 업데이트', () => {
    test('결제 상태를 업데이트한다.', async () => {
      const [payment] = await paymentsRepository.find();

      const updatedStatus = PaymentStatus.COMPLETED;

      await request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: /* GraphQL */ `
            mutation {
              updatePaymentStatus(
                input: { 
                paymentId: ${payment.id}, 
                status: COMPLETED,  
                transactionId: "${TEST_PAYMENT.transactionId}" 
                }
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
              data: { updatePaymentStatus },
            },
          } = res;

          expect(updatePaymentStatus.ok).toBe(true);
          expect(updatePaymentStatus.error).toBe(null);
        });

      const updatedPayment = await paymentsRepository.findOne({
        where: { id: payment.id },
      });
      expect(updatedPayment.status).toBe(updatedStatus);
      expect(updatedPayment.transactionId).toBe(TEST_PAYMENT.transactionId);
    });
  });
});
