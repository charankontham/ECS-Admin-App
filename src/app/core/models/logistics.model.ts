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

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  status: OrderTrackingStatusEnum;
  customerName: string;
  shippingAddress: string;
  orderDate: string;
  expectedDeliveryDate: string;
}

export interface Delivery {
  deliveryId: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  customerName: string;
  deliveryAgentId: string;
  deliveryAgentName: string;
  deliveryHubId: string;
  deliveryHubName: string;
  status: OrderTrackingStatusEnum;
  pickupDate: string;
  deliveryDate: string;
  trackingNumber: string;
  shippingAddress: string;
}

export interface ReturnOrder {
  returnOrderId: string;
  orderId: string;
  orderItemId: string;
  customerId: string;
  customerName: string;
  productName: string;
  reason: string;
  status: string;
  returnDate: string;
  refundAmount: number;
  approvedBy?: string;
}

export interface DeliveryAgent {
  agentId: string;
  agentName: string;
  email: string;
  phone: string;
  deliveryHubId: string;
  deliveryHubName: string;
  status: string;
  activeDeliveries: number;
  totalDeliveries: number;
  rating: number;
  joinDate: string;
}

export interface DeliveryHub {
  hubId: string;
  hubName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  managerId: string;
  managerName: string;
  activeAgents: number;
  totalCapacity: number;
  phone: string;
  email: string;
  status: string;
}
