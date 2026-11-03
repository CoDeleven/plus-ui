export type OrderAmount = number | string;

export type PaymentStatus =
  | 'PENDING'
  | 'CHECKOUT_CREATED'
  | 'PROCESSING'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'EXPIRED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED';

export type RefundStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';

export interface OrderRefundForm {
  amount: string;
  reason: string;
}

export interface OrderRefundVO {
  id: string | number;
  orderId: string | number;
  stripeRefundId?: string;
  amount: OrderAmount;
  currency: string;
  status: RefundStatus;
  reason: string;
  createTime?: string;
}

export interface OrderTravelerVO {
  id: string | number;
  orderId: string | number;
  travelerNo: number;
  primaryTraveler: boolean;
  title?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  noMiddleName?: boolean;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  placeOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiryDate?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderExtraVO {
  id: string | number;
  orderId: string | number;
  extraType: string;
  refId?: string | number;
  title: string;
  description?: string;
  amount: OrderAmount;
  quantity: number;
  metadata?: string;
}

export interface OrderPaymentVO {
  id: string | number;
  orderId: string | number;
  paymentNo: string;
  paymentMethod: string;
  amount: OrderAmount;
  currency: string;
  status: PaymentStatus;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  checkoutExpiresAt?: string;
  paidTime?: string;
}

export interface OrderVO {
  id: string | number;
  orderNo: string;
  customerUserId: string | number;
  customerUsername: string;
  customerEmail: string;
  tourId: string | number;
  tourCode?: string;
  tourName: string;
  tourCoverImage?: string;
  departureId: string | number;
  departureDate?: string;
  returnDate?: string;
  travelerCount: number;
  currency: string;
  unitPrice: OrderAmount;
  tourAmount: OrderAmount;
  extrasAmount: OrderAmount;
  totalAmount: OrderAmount;
  paidAmount: OrderAmount;
  refundedAmount?: OrderAmount;
  paymentDeadline?: string;
  status: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactCity?: string;
  contactRegion?: string;
  contactPostalCode?: string;
  contactCountry?: string;
  termsAccepted?: boolean;
  remark?: string;
  createTime?: string;
  travelers?: OrderTravelerVO[];
  extras?: OrderExtraVO[];
  payment?: OrderPaymentVO;
  refunds?: OrderRefundVO[];
}

export interface OrderQuery extends PageQuery {
  orderNo?: string;
  customerKeyword?: string;
  tourName?: string;
  status?: number;
  params?: any;
}
