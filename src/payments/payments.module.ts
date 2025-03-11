import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { Payment } from './entities/payment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order]), OrdersModule],
  providers: [PaymentsService, PaymentsResolver],
})
export class PaymentsModule {}
