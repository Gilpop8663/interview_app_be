import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { GetOrderListOutput } from './dtos/get-orders-dto';
import {
  GetOrderDetailInput,
  GetOrderDetailOutput,
} from './dtos/get-order-detail-dto';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order-dto';
import { DeleteOrderInput, DeleteOrderOutput } from './dtos/delete-order-dto';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import {
  UpdateOrderStatusInput,
  UpdateOrderStatusOutput,
} from './dtos/update-order-status-dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { PaypalService } from './paypal.service';
import { CreatePaypalOrderOutput } from './dtos/create-paypal-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
    private readonly i18n: I18nService,
    private readonly paypalService: PaypalService,
  ) {}

  // 모든 주문 조회
  async getOrderList(): Promise<GetOrderListOutput> {
    try {
      const orderList = await this.orders.find({
        relations: ['user', 'product'],
      }); // 관계를 포함하여 조회

      return { ok: true, orderList };
    } catch (error) {
      const order_list_query_failed = this.i18n.t(
        'error.order_list_query_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: order_list_query_failed };
    }
  }

  // 단일 주문 조회
  async getOrderDetail({
    orderId,
  }: GetOrderDetailInput): Promise<GetOrderDetailOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: orderId },
        relations: ['user', 'product'],
      });

      return { ok: true, order };
    } catch (error) {
      const order_query_failed = this.i18n.t('error.order_query_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: order_query_failed };
    }
  }

  // 주문 생성
  async createOrder(
    { productId, totalAmount, currency }: CreateOrderInput,
    userId: number,
  ): Promise<CreateOrderOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });

      const product = await this.products.findOne({ where: { id: productId } });

      const order = this.orders.create({
        user,
        product,
        totalAmount,
        status: OrderStatus.PENDING,
        currency,
      });

      const result = await this.orders.save(order);

      return { ok: true, orderId: result.id };
    } catch (error) {
      const order_creation_failed = this.i18n.t('error.order_creation_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: order_creation_failed };
    }
  }

  async createPaypalOrder(
    { productId, totalAmount, currency }: CreateOrderInput,
    userId: number,
  ): Promise<CreatePaypalOrderOutput> {
    try {
      const { orderId } = await this.createOrder(
        { productId, totalAmount, currency },
        userId,
      );
      const { orderData } = await this.paypalService.createPaypalOrder({
        amount: totalAmount,
      });

      if (!orderData) {
        return { ok: false };
      }

      return { ok: true, orderData, orderId };
    } catch (error) {
      const order_creation_failed = this.i18n.t('error.order_creation_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: order_creation_failed };
    }
  }

  // 주문 삭제
  async deleteOrder({ orderId }: DeleteOrderInput): Promise<DeleteOrderOutput> {
    try {
      await this.orders.delete(orderId);

      return { ok: true };
    } catch (error) {
      const order_deletion_failed = this.i18n.t('error.order_deletion_failed', {
        lang: I18nContext.current().lang,
      });

      return { ok: false, error: order_deletion_failed };
    }
  }

  // 주문 상태 변경
  async updateOrderStatus({
    orderId,
    status,
  }: UpdateOrderStatusInput): Promise<UpdateOrderStatusOutput> {
    try {
      const order = await this.orders.findOne({ where: { id: orderId } });

      if (!order) {
        const order_not_exist = this.i18n.t('error.order_not_exist', {
          lang: I18nContext.current().lang,
        });

        return { ok: false, error: order_not_exist };
      }

      order.status = status; // 상태 변경
      await this.orders.save(order);

      return { ok: true };
    } catch (error) {
      const order_status_change_failed = this.i18n.t(
        'error.order_status_change_failed',
        {
          lang: I18nContext.current().lang,
        },
      );

      return { ok: false, error: order_status_change_failed };
    }
  }
}
