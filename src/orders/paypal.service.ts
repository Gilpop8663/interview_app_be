import { Injectable } from '@nestjs/common';
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  OrdersController,
} from '@paypal/paypal-server-sdk';
import * as dotenv from 'dotenv';
import {
  CreatePaypalOrderInput,
  CreatePaypalOrderOutput,
} from './dtos/create-paypal-order.dto';
import {
  CapturePaypalOrderInput,
  CapturePaypalOrderOutput,
} from './dtos/capture-paypal-order.dto';

dotenv.config();

@Injectable()
export class PaypalService {
  private client: Client;
  private ordersController: OrdersController;

  constructor() {
    const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
      },
      environment: Environment.Sandbox, // 샌드박스 환경
    });
    this.ordersController = new OrdersController(this.client);
  }

  async createPaypalOrder({
    amount,
  }: CreatePaypalOrderInput): Promise<CreatePaypalOrderOutput> {
    const orderData = {
      body: {
        intent: CheckoutPaymentIntent.Capture, // 수정,
        purchaseUnits: [
          {
            amount: {
              currencyCode: 'USD',
              value: amount.toString(),
            },
          },
        ],
      },
    };

    try {
      const { body, ...httpResponse } =
        await this.ordersController.ordersCreate(orderData);

      if (typeof body !== 'string') return;

      if (httpResponse.statusCode !== 201) {
        return { ok: false };
      }

      return {
        ok: true,
        orderData: JSON.parse(body),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
    }
  }

  async capturePaypalOrder({
    orderId,
  }: CapturePaypalOrderInput): Promise<CapturePaypalOrderOutput> {
    const orderData = {
      id: orderId,
    };

    try {
      const { body, ...httpResponse } =
        await this.ordersController.ordersCapture(orderData);

      if (typeof body !== 'string') return; // 문자열이 아닐 경우 조기 반환

      if (httpResponse.statusCode !== 201) {
        return { ok: false };
      }

      return {
        ok: true,
        orderData: JSON.parse(body),
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
    }
  }
}
