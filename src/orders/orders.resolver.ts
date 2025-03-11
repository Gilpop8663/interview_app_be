import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { GetOrderListOutput } from './dtos/get-orders-dto';
import {
  GetOrderDetailInput,
  GetOrderDetailOutput,
} from './dtos/get-order-detail-dto';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order-dto';
import { DeleteOrderInput, DeleteOrderOutput } from './dtos/delete-order-dto';
import {
  UpdateOrderStatusInput,
  UpdateOrderStatusOutput,
} from './dtos/update-order-status-dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreatePaypalOrderOutput } from './dtos/create-paypal-order.dto';
import {
  CapturePaypalOrderInput,
  CapturePaypalOrderOutput,
} from './dtos/capture-paypal-order.dto';
import { PaypalService } from './paypal.service';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paypalService: PaypalService,
  ) {}

  // 모든 주문 조회
  @Query(() => GetOrderListOutput)
  async getOrderList() {
    return this.ordersService.getOrderList();
  }

  // 단일 주문 조회
  @Query(() => GetOrderDetailOutput)
  async getOrderDetail(@Args('input') input: GetOrderDetailInput) {
    return this.ordersService.getOrderDetail(input);
  }

  // 주문 생성
  @Mutation(() => CreateOrderOutput)
  @UseGuards(AuthGuard)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @AuthUser() user: User,
  ) {
    return this.ordersService.createOrder(input, user.id);
  }

  @Mutation(() => CreatePaypalOrderOutput)
  @UseGuards(AuthGuard)
  async createPaypalOrder(
    @Args('input') input: CreateOrderInput,
    @AuthUser() user: User,
  ) {
    console.log(input);

    return this.ordersService.createPaypalOrder(input, user.id);
  }

  @Mutation(() => CapturePaypalOrderOutput)
  @UseGuards(AuthGuard)
  async capturePaypalOrder(@Args('input') input: CapturePaypalOrderInput) {
    return this.paypalService.capturePaypalOrder(input);
  }

  // 주문 삭제
  @Mutation(() => DeleteOrderOutput)
  async deleteOrder(@Args('input') input: DeleteOrderInput) {
    return this.ordersService.deleteOrder(input);
  }

  @Mutation(() => UpdateOrderStatusOutput)
  async updateOrderStatus(@Args('input') input: UpdateOrderStatusInput) {
    return this.ordersService.updateOrderStatus(input);
  }
}
