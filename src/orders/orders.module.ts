import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { PaypalService } from './paypal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, User])],
  providers: [OrdersService, OrdersResolver, PaypalService],
  exports: [OrdersService],
})
export class OrdersModule {}
