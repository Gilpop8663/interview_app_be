import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CapturePaypalOrderInput {
  @Field(() => String)
  orderId: string;
}

// Name 타입 정의
@ObjectType()
class Name {
  @Field(() => String)
  given_name: string;

  @Field(() => String)
  surname: string;
}

// PaypalDetails 타입 정의
@ObjectType()
class PaypalDetails {
  @Field(() => Name)
  name: Name;

  @Field(() => String)
  email_address: string;

  @Field(() => String)
  account_id: string;
}

// Address 타입 정의
@ObjectType()
class Address {
  @Field(() => String)
  address_line_1: string;

  @Field(() => String, { nullable: true })
  address_line_2?: string;

  @Field(() => String)
  admin_area_2: string;

  @Field(() => String)
  admin_area_1: string;

  @Field(() => String)
  postal_code: string;

  @Field(() => String)
  country_code: string;
}

// Shipping 타입 정의
@ObjectType()
class Shipping {
  @Field(() => Address)
  address: Address;
}

// Payments 타입 정의
@ObjectType()
class Payments {
  @Field(() => [Capture])
  captures: Capture[];
}

// PurchaseUnit 타입 정의
@ObjectType()
class PurchaseUnit {
  @Field(() => String)
  reference_id: string;

  @Field(() => Shipping)
  shipping: Shipping;

  @Field(() => Payments)
  payments: Payments;
}

// Link 타입 정의
@ObjectType()
class Link {
  @Field(() => String)
  href: string;

  @Field(() => String)
  rel: string;

  @Field(() => String)
  method: string;
}

@ObjectType()
class Amount {
  @Field(() => String)
  currency_code: string;

  @Field(() => String)
  value: string;
}

// SellerProtection 타입 정의
@ObjectType()
class SellerProtection {
  @Field(() => String)
  status: string;

  @Field(() => [String])
  dispute_categories: string[];
}

// SellerReceivableBreakdown 타입 정의
@ObjectType()
class SellerReceivableBreakdown {
  @Field(() => Amount)
  gross_amount: Amount;

  @Field(() => Amount)
  paypal_fee: Amount;

  @Field(() => Amount)
  net_amount: Amount;
}

// Capture 타입 정의
@ObjectType()
class Capture {
  @Field(() => String)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => Amount)
  amount: Amount;

  @Field(() => SellerProtection)
  seller_protection: SellerProtection;

  @Field(() => Boolean)
  final_capture: boolean;

  @Field(() => String)
  disbursement_mode: string;

  @Field(() => SellerReceivableBreakdown)
  seller_receivable_breakdown: SellerReceivableBreakdown;

  @Field(() => String)
  create_time: string;

  @Field(() => String)
  update_time: string;

  @Field(() => [Link])
  links: Link[];
}

// Payer 타입 정의
@ObjectType()
class Payer {
  @Field(() => Name)
  name: Name;

  @Field(() => String)
  email_address: string;

  @Field(() => String)
  payer_id: string;
}

// PaymentSource 타입 정의
@ObjectType()
class PaymentSource {
  @Field(() => PaypalDetails)
  paypal: PaypalDetails;
}

// PayPal 주문 데이터 구조 정의
@ObjectType()
export class PaypalOrderData {
  @Field(() => String)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => PaymentSource)
  payment_source: PaymentSource;

  @Field(() => [PurchaseUnit])
  purchase_units: PurchaseUnit[];

  @Field(() => Payer)
  payer: Payer;

  @Field(() => [Link])
  links: Link[];
}

@ObjectType()
export class CapturePaypalOrderOutput extends CoreOutput {
  @Field(() => PaypalOrderData, { nullable: true })
  orderData?: PaypalOrderData;
}
