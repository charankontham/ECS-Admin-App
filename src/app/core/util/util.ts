export const OrderStatusClassMap: { [key: number]: string } = {
  1: 'status-order-placed',
  2: 'status-in-transit',
  3: 'status-shipped',
  4: 'status-waiting-for-delivery-agent',
  5: 'status-out-for-delivery',
  6: 'status-delivered',
  7: 'status-returned-to-delivery-hub',
  8: 'status-cancelled',
};

export const AvailabilityStatusClassMap: { [key: number]: string } = {
  1: 'status-available',
  2: 'status-busy',
  3: 'status-on-leave',
  4: 'status-unavailable',
};

export enum OrderTrackingStatusEnum {
  OrderPlaced = 1,
  ShipmentInTransit = 2,
  Shipped = 3,
  WaitingForDeliveryAgent = 4,
  OutForDelivery = 5,
  Delivered = 6,
  ReturnedToDeliveryHub = 7,
  Cancelled = 8,
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

export const ORDER_TRACKING_STATUS_MAP: Readonly<Record<number, string>> = {
  [OrderTrackingStatusEnum.OrderPlaced]: 'Order Placed',
  [OrderTrackingStatusEnum.ShipmentInTransit]: 'In Transit',
  [OrderTrackingStatusEnum.Shipped]: 'Shipped',
  [OrderTrackingStatusEnum.WaitingForDeliveryAgent]: 'Waiting For Agent',
  [OrderTrackingStatusEnum.OutForDelivery]: 'Out For Delivery',
  [OrderTrackingStatusEnum.Delivered]: 'Delivered',
  [OrderTrackingStatusEnum.ReturnedToDeliveryHub]: 'Returned To Delivery Hub',
  [OrderTrackingStatusEnum.Cancelled]: 'Cancelled',
};

export const ORDER_TRACKING_TYPE_MAP: Readonly<Record<number, string>> = {
  [OrderTrackingTypeEnum.Delivery]: 'Delivery',
  [OrderTrackingTypeEnum.ReturnPickup]: 'Return Pickup',
  [OrderTrackingTypeEnum.Exchange]: 'Exchange',
};

export const AVAILABILITY_STATUS_MAP: Readonly<Record<number, string>> = {
  [AvailabilityStatus.Available]: 'Available',
  [AvailabilityStatus.Busy]: 'Busy',
  [AvailabilityStatus.OnLeave]: 'On Leave',
  [AvailabilityStatus.Unavailable]: 'Unavailable',
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
