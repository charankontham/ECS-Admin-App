import { ProductBrand } from '../models/product-brand.model';
import { ProductCategory, SubCategory } from '../models/product-category.model';

export const OrderStatusClassMap: { [key: number]: string } = {
  1: 'status-order-placed',
  2: 'status-in-transit',
  3: 'status-shipped',
  4: 'status-waiting-for-delivery-agent',
  5: 'status-out-for-delivery',
  6: 'status-delivered',
  7: 'status-cancelled',
  8: 'status-returned-to-delivery-hub',
};

export const AvailabilityStatusClassMap: { [key: number]: string } = {
  1: 'status-available',
  2: 'status-busy',
  3: 'status-on-leave',
  4: 'status-unavailable',
};

export const PaymentStatusClassMap: { [key: number]: string } = {
  1: 'paid',
  2: 'pending',
  3: 'failed',
  4: 'refunded',
  5: 'cancelled',
};

export enum OrderTrackingStatusEnum {
  OrderPlaced = 1,
  ShipmentInTransit = 2,
  Shipped = 3,
  WaitingForDeliveryAgent = 4,
  OutForDelivery = 5,
  Delivered = 6,
  Cancelled = 7,
  ReturnedToDeliveryHub = 8,
}

export enum OrderTrackingTypeEnum {
  Delivery = 1,
  ReturnPickup = 2,
  Exchange = 3,
}

export enum AvailabilityStatus {
  Available = 1,
  Busy = 2,
  OnLeave = 3,
  Unavailable = 4,
}

export enum PaymentMethodEnum {
  CreditCard = 1,
  DebitCard = 2,
  NetBanking = 3,
  UPI = 4,
  Wallets = 5,
  Paypal = 6,
}

export const ORDER_TRACKING_STATUS_MAP: Readonly<Record<number, string>> = {
  [OrderTrackingStatusEnum.OrderPlaced]: 'Order Placed',
  [OrderTrackingStatusEnum.ShipmentInTransit]: 'In Transit',
  [OrderTrackingStatusEnum.Shipped]: 'Shipped',
  [OrderTrackingStatusEnum.WaitingForDeliveryAgent]: 'Waiting For Agent',
  [OrderTrackingStatusEnum.OutForDelivery]: 'Out For Delivery',
  [OrderTrackingStatusEnum.Delivered]: 'Delivered',
  [OrderTrackingStatusEnum.Cancelled]: 'Cancelled',
  [OrderTrackingStatusEnum.ReturnedToDeliveryHub]: 'Returned',
};

export const ORDER_TRACKING_TYPE_MAP: Readonly<Record<number, string>> = {
  [OrderTrackingTypeEnum.Delivery]: 'Delivery',
  [OrderTrackingTypeEnum.ReturnPickup]: 'Return Pickup',
  [OrderTrackingTypeEnum.Exchange]: 'Exchange',
};

export const ORDER_RETURN_STATUS_MAP: Readonly<Record<number, string>> = {
  1: 'Return Requested',
  2: 'Return Accepted',
  3: 'Ready For Pickup',
  4: 'Waiting For Agent',
  5: 'Out For Pickup',
  6: 'Returned',
  7: 'Refund Issued',
};

export const AVAILABILITY_STATUS_MAP: Readonly<Record<number, string>> = {
  [AvailabilityStatus.Available]: 'Available',
  [AvailabilityStatus.Busy]: 'Busy',
  [AvailabilityStatus.OnLeave]: 'On Leave',
  [AvailabilityStatus.Unavailable]: 'Unavailable',
};

export const PAYMENT_METHOD_MAP: Readonly<Record<number, string>> = {
  [PaymentMethodEnum.CreditCard]: 'Credit Card',
  [PaymentMethodEnum.DebitCard]: 'Debit Card',
  [PaymentMethodEnum.NetBanking]: 'Net Banking',
  [PaymentMethodEnum.UPI]: 'UPI',
  [PaymentMethodEnum.Wallets]: 'Wallets',
  [PaymentMethodEnum.Paypal]: 'Paypal',
};

export enum ReturnReasonCategoryEnum {
  DamagedProduct = 1,
  WrongItem = 2,
  NotAsDescribed = 3,
  LowProductQuality = 4,
  ChangedMind = 5,
  Other = 6,
}

export const RETURN_REASON_CATEGORY_MAP: Readonly<Record<number, string>> = {
  [ReturnReasonCategoryEnum.DamagedProduct]: 'Received damaged product',
  [ReturnReasonCategoryEnum.WrongItem]: 'Wrong item delivered',
  [ReturnReasonCategoryEnum.NotAsDescribed]: 'Item not as described',
  [ReturnReasonCategoryEnum.LowProductQuality]:
    'Product quality not satisfactory',
  [ReturnReasonCategoryEnum.ChangedMind]: 'Changed my mind',
  [ReturnReasonCategoryEnum.Other]: 'Other',
};

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const compare = (
  a: number | string | Date = 0,
  b: number | string | Date = 0,
  isAsc: boolean
): number => {
  const dateA =
    typeof a === 'string' && !isNaN(Date.parse(a)) ? new Date(a) : a;
  const dateB =
    typeof b === 'string' && !isNaN(Date.parse(b)) ? new Date(b) : b;

  if (dateA instanceof Date && dateB instanceof Date) {
    const result = dateA.getTime() - dateB.getTime();
    return (result < 0 ? -1 : result > 0 ? 1 : 0) * (isAsc ? 1 : -1);
  }
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
};

export const compareSubCategories = (sc1: SubCategory, sc2: SubCategory) =>
  sc1 && sc2 && sc1.subCategoryId === sc2.subCategoryId;

export const compareBrands = (b1: ProductBrand, b2: ProductBrand) =>
  b1 && b2 && b1.brandId === b2.brandId;

export const compareCategories = (c1: ProductCategory, c2: ProductCategory) =>
  c1 && c2 && c1.categoryId === c2.categoryId;
