import { AddressDto, BaseFilters } from './common.model';
import { DeliveryAgent, DeliveryHub } from './delivery.model';
import { Product } from './product.model';

export interface OrderItemEnriched {
  product: Product;
  orderItemStatus: number;
}

export interface CustomerDto {
  customerId: number;
  customerName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface OrderRequest {
  orderId: number;
  customerId: number;
  addressId: number;
  paymentType: number;
  paymentStatus: number;
  shippingFee: number;
  orderDate: Date;
  orderStatus: number;
}

export interface Order {
  orderId: number;
  customer: CustomerDto;
  shippingAddress: AddressDto;
  orderItems: OrderItemEnriched[];
  itemsSubTotal: number;
  shippingFee: number;
  totalTax: number;
  totalOrderValue: number;
  orderDate: Date;
  orderStatus: number;
  paymentType: number;
  paymentStatus: number;
}

export interface OrderReturnRequest {
  OrderReturnId: number;
  OrderItemId: number;
  ProductQuantity: number;
  CustomerId: number;
  PickupAddressId: number;
  OrderTrackingId?: string;
  ReturnReasonCategoryId: number;
  ReturnReason?: string;
  DateAdded: Date;
  DateModified: Date;
  ReturnPaymentSourceId: number;
}

export interface OrderReturn {
  orderReturnId: number;
  orderItemId: number;
  productQuantity: number;
  customerId: number;
  orderTracking?: OrderTracking;
  returnReasonCategoryId: number;
  returnReason?: string;
  dateAdded: Date;
  dateModified: Date;
  returnPaymentSourceId: number;
}

export interface OrderTrackingRequest {
  orderTrackingId?: string;
  productId: number;
  orderItemId: number;
  deliveryAgentId?: number;
  nearestHubId?: number;
  orderTrackingStatusId: number;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  customerAddressId: number;
  customerInstructions?: string;
  orderTrackingType: number;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  productPrice: number;
}

export interface OrderTracking {
  orderTrackingId: string;
  orderItem?: OrderItem;
  product?: Product;
  deliveryAgent?: DeliveryAgent;
  nearestHub?: DeliveryHub;
  orderTrackingStatusId: number;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  customerAddress?: AddressDto;
  customerInstructions?: string;
  orderTrackingType: number;
}

export interface OrderFilters extends BaseFilters {
  type: 'order';
  customerId?: number | null;
  orderStatus?: number | null;
  paymentStatus?: number | null;
  paymentType?: number | null;
  categoryId?: number | null;
  subCategoryId?: number | null;
  brandId?: number | null;
  productId?: number | null;
  totalOrderAmount?: number | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipcode?: string | null;
  orderDateFrom?: Date | null;
  orderDateTo?: Date | null;
  sellerId?: number | null;
}

export interface OrderItemFilters extends BaseFilters {
  type: 'orderItem';
  orderId?: number | null;
  orderItemStatus?: number | null;
  productId?: number | null;
}

export interface OrderTrackingFilters extends BaseFilters {
  type: 'orderTracking';
  deliveryAgentId?: number | null;
  estimatedDeliveryDate?: Date | null;
  orderTrackingStatusId?: number | null;
  orderTrackingType?: number | null;
}

export interface OrderReturnFilters extends BaseFilters {
  type: 'orderReturn';
  fromDate?: Date | null;
  toDate?: Date | null;
  productId?: number | null;
  categoryId?: number | null;
  subCategoryId?: number | null;
  brandId?: number | null;
  returnReasonCategoryId?: number | null;
}
