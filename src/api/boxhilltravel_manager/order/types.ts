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
  amount: number;
  quantity: number;
  metadata?: string;
}

export interface OrderPaymentVO {
  id: string | number;
  orderId: string | number;
  paymentNo: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: number;
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
  unitPrice: number;
  tourAmount: number;
  extrasAmount: number;
  totalAmount: number;
  paidAmount: number;
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
}

export interface OrderQuery extends PageQuery {
  orderNo?: string;
  customerKeyword?: string;
  tourName?: string;
  status?: number;
  params?: any;
}
