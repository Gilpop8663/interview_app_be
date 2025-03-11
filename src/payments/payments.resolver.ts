import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
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
import { GetPaymentListOutput } from './dtos/get-payment-list.dto';
import {
  CompletePaymentInput,
  CompletePaymentOutput,
} from './dtos/complete-payment.dto';

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  // 결제 생성
  @Mutation(() => CreatePaymentOutput)
  async createPayment(@Args('input') input: CreatePaymentInput) {
    return this.paymentsService.createPayment(input);
  }

  // 결제 전체 조회
  @Query(() => GetPaymentListOutput)
  async getPaymentList() {
    return this.paymentsService.getPaymentList();
  }

  // 결제 상세 조회
  @Query(() => GetPaymentDetailOutput)
  async getPaymentDetail(@Args('input') input: GetPaymentDetailInput) {
    return this.paymentsService.getPaymentDetail(input);
  }

  @Mutation(() => UpdatePaymentStatusOutput)
  async updatePaymentStatus(@Args('input') input: UpdatePaymentStatusInput) {
    return this.paymentsService.updatePaymentStatus(input);
  }

  @Mutation(() => CompletePaymentOutput)
  async completePayment(@Args('input') input: CompletePaymentInput) {
    return this.paymentsService.completePayment(input);
  }
}
