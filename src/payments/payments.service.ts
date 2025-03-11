import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment-dto';
import {
  GetPaymentDetailInput,
  GetPaymentDetailOutput,
} from './dtos/get-payment-detail-dto';
import {
  UpdatePaymentStatusInput,
  UpdatePaymentStatusOutput,
} from './dtos/update-payment-status.dto';
import { OrdersService } from 'src/orders/orders.service';
import { GetPaymentListOutput } from './dtos/get-payment-list.dto';
import {
  CompletePaymentInput,
  CompletePaymentOutput,
} from './dtos/complete-payment.dto';
import { logErrorAndThrow } from 'src/utils';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    private readonly ordersService: OrdersService,
    private readonly i18n: I18nService,
  ) {}

  // 결제 생성
  async createPayment({
    orderId,
    amount,
    currency,
    transactionId,
  }: CreatePaymentInput): Promise<CreatePaymentOutput> {
    try {
      const order = await this.orders.findOne({ where: { id: orderId } });

      const payment = this.payments.create({
        order,
        amount,
        status: PaymentStatus.PENDING,
        currency,
      });

      if (transactionId) {
        payment.transactionId = transactionId;
      }

      const result = await this.payments.save(payment);

      return { ok: true, paymentId: result.id };
    } catch (error) {
      const payment_creation_failed = this.i18n.t(
        'error.payment_creation_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: payment_creation_failed };
    }
  }

  async getPaymentList(): Promise<GetPaymentListOutput> {
    try {
      const paymentList = await this.payments.find({
        relations: ['order'],
      }); // 관계를 포함하여 조회

      return { ok: true, paymentList };
    } catch (error) {
      const payment_list_query_failed = this.i18n.t(
        'error.payment_list_query_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: payment_list_query_failed };
    }
  }

  // 결제 상세 조회
  async getPaymentDetail({
    paymentId,
  }: GetPaymentDetailInput): Promise<GetPaymentDetailOutput> {
    try {
      const payment = await this.payments.findOne({
        where: { id: paymentId },
        relations: ['order'],
      });

      return { ok: true, payment };
    } catch (error) {
      const payment_query_failed = this.i18n.t('error.payment_query_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: payment_query_failed };
    }
  }

  // 결제 완료 처리
  async completePayment({
    paymentId,
    orderId,
    transactionId,
  }: CompletePaymentInput): Promise<CompletePaymentOutput> {
    try {
      // 1. 포트원 결제내역 단건조회 API 호출
      const paymentResponse = await fetch(
        `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        {
          headers: {
            Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          },
        },
      );

      if (!paymentResponse.ok) {
        const payment_query_error = this.i18n.t('error.payment_query_error', {
          lang: I18nContext.current().lang,
          args: { message: await paymentResponse.text() },
        });

        return {
          ok: false,
          error: payment_query_error,
        };
      }

      const payment = await paymentResponse.json();

      // 2. 고객사 내부 주문 데이터의 가격과 실제 지불된 금액을 비교합니다.
      const { order } = await this.ordersService.getOrderDetail({ orderId });

      // order.totalAmount를 소수점 두 자리로 고정 (문자열로 변환)
      const orderAmount = parseFloat(String(order.totalAmount)).toFixed(2);

      // payment.amount.total을 소수점 두 자리로 고정 (문자열로 변환)
      const paymentAmount = payment.amount.total.toFixed(2);

      if (orderAmount === paymentAmount) {
        switch (payment.status) {
          case 'VIRTUAL_ACCOUNT_ISSUED': {
            const virtual_account_not_supported = this.i18n.t(
              'error.virtual_account_not_supported',
              {
                lang: I18nContext.current().lang,
              },
            );

            return { ok: false, error: virtual_account_not_supported };
          }
          case 'PAID': {
            // 결제가 완료되었습니다.
            return await this.updatePaymentStatus({
              paymentId,
              status: PaymentStatus.COMPLETED,
              transactionId,
            });
          }
        }
      }

      // 결제 금액이 불일치하여 위/변조 시도가 의심됩니다.
      const payment_amount_mismatch = this.i18n.t(
        'error.payment_amount_mismatch',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: payment_amount_mismatch };
    } catch (error) {
      const payment_validation_failed = this.i18n.t(
        'error.payment_validation_failed',
        {
          lang: I18nContext.current().lang,
          args: { message: error.message },
        },
      );

      return logErrorAndThrow(error, payment_validation_failed);
    }
  }

  // 결제 상태 업데이트 메서드
  async updatePaymentStatus({
    paymentId,
    status,
    transactionId,
  }: UpdatePaymentStatusInput): Promise<UpdatePaymentStatusOutput> {
    const payment = await this.payments.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      const payment_not_exist = this.i18n.t('error.payment_not_exist', {
        lang: I18nContext.current().lang,
      });

      throw new Error(payment_not_exist);
    }

    payment.status = status; // 상태 변경
    payment.transactionId = transactionId;
    await this.payments.save(payment);

    // 결제 상태에 따라 주문 상태 업데이트
    if (status === PaymentStatus.COMPLETED) {
      await this.ordersService.updateOrderStatus({
        orderId: payment.order.id,
        status: OrderStatus.COMPLETED,
      });

      return { ok: true };
    }

    return { ok: true };
  }
}
