import { Component } from '@angular/core';
import {
  ORDER_RETURN_STATUS_MAP,
  OrderTrackingStatusEnum,
  PAYMENT_METHOD_MAP,
  PaymentStatusClassMap,
} from '../../../../core/util/util';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { OrderService } from '../../../../core/services/order.service';
import { Order, OrderTracking } from '../../../../core/models/order.model';
import { OrderTrackingService } from '../../../../core/services/order-tracking.service';

interface OrderItemDetail {
  orderItemId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: OrderTrackingStatusEnum;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  deliveryHubId?: string;
  deliveryHubName?: string;
  expectedDeliveryDate?: string;
  deliveryInstructions?: string;
  trackingNumber?: string;
  sellerName?: string;
  sellerId?: string;
}

// interface Order {
//   orderId: string;
//   orderDate: string;
//   customerId: string;
//   customerName: string;
//   customerEmail: string;
//   customerPhone: string;
//   shippingAddress: string;
//   shippingCity: string;
//   shippingState: string;
//   shippingPincode: string;
//   shippingFee: number;
//   totalOrderValue: number;
//   paymentType: string;
//   paymentStatus: string;
//   orderItems: OrderItemDetail[];
// }

@Component({
  selector: 'app-view-order-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatTableModule,
  ],
  templateUrl: './view-order.component.html',
  styleUrl: './view-order.component.css',
})
export class ViewOrderComponent {
  order: Order | null = null;
  ordersTracking: OrderTracking[] = [];
  isOrderInfoLoading = true;
  isOrderTrackingLoading = true;
  error: string | null = null;
  OrderTrackingStatusEnum = OrderTrackingStatusEnum;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private orderService: OrderService,
    private orderTrackingService: OrderTrackingService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const orderId = params.get('orderId');
      if (!isNaN(Number(orderId))) {
        this.loadOrder(Number(orderId));
      } else {
        this.error = 'Order ID not found';
        this.isOrderInfoLoading = false;
      }
    });
  }

  loadOrder(orderId: number): void {
    this.isOrderInfoLoading = true;
    this.isOrderTrackingLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response) {
          this.order = response;
          this.isOrderInfoLoading = false;
          this.order.orderItems.forEach((orderItem) => {
            this.loadOrderTracking(orderId, orderItem.product.productId);
          });
          this.isOrderTrackingLoading = false;
        }
        this.isOrderInfoLoading = false;
        this.isOrderTrackingLoading = false;
      },
      error: (error) => {
        console.error('Failed to load Order : ', error);
        this.error = 'Order ID not found!';
        this.isOrderInfoLoading = false;
        this.isOrderTrackingLoading = false;
      },
    });
  }

  loadOrderTracking(orderId: number, productId: number) {
    this.orderTrackingService
      .getOrderTrackingByOrderIdAndProductId(orderId, productId)
      .subscribe({
        next: (response: OrderTracking[]) => {
          response.forEach((ot) => {
            this.ordersTracking.push(ot);
          });
        },
        error: (error) => {
          console.error('Failed to load order tracking : ', error);
        },
      });
  }

  getStatusLabel(status: OrderTrackingStatusEnum): string {
    const statusLabels: { [key in OrderTrackingStatusEnum]: string } = {
      [OrderTrackingStatusEnum.OrderPlaced]: 'Order Placed',
      [OrderTrackingStatusEnum.ShipmentInTransit]: 'Shipment In Transit',
      [OrderTrackingStatusEnum.Shipped]: 'Shipped',
      [OrderTrackingStatusEnum.WaitingForDeliveryAgent]:
        'Waiting For Delivery Agent',
      [OrderTrackingStatusEnum.OutForDelivery]: 'Out For Delivery',
      [OrderTrackingStatusEnum.Delivered]: 'Delivered',
      [OrderTrackingStatusEnum.ReturnedToDeliveryHub]: 'Returned',
      [OrderTrackingStatusEnum.Cancelled]: 'Cancelled',
    };
    return statusLabels[status];
  }

  getStatusClass(status: OrderTrackingStatusEnum): string {
    const statusClasses: { [key in OrderTrackingStatusEnum]: string } = {
      [OrderTrackingStatusEnum.OrderPlaced]: 'status-order-placed',
      [OrderTrackingStatusEnum.ShipmentInTransit]: 'status-shipment-in-transit',
      [OrderTrackingStatusEnum.Shipped]: 'status-shipped',
      [OrderTrackingStatusEnum.WaitingForDeliveryAgent]:
        'status-waiting-for-delivery-agent',
      [OrderTrackingStatusEnum.OutForDelivery]: 'status-out-for-delivery',
      [OrderTrackingStatusEnum.Delivered]: 'status-delivered',
      [OrderTrackingStatusEnum.ReturnedToDeliveryHub]:
        'status-returned-to-delivery-hub',
      [OrderTrackingStatusEnum.Cancelled]: 'status-cancelled',
    };
    return statusClasses[status];
  }

  getPaymentStatusClass(status: number): string {
    return 'payment-' + PaymentStatusClassMap[status];
  }

  getPaymentStatusValue(status: number): string {
    return PaymentStatusClassMap[status];
  }

  getPaymentTypeValue(type: number) {
    return PAYMENT_METHOD_MAP[type];
  }

  goBack(): void {
    const referrer = document.referrer;
    if (
      referrer.includes('/logistics/orders') &&
      !referrer.includes('/logistics/orders/')
    ) {
      this.location.back();
    } else {
      this.router.navigate(['/logistics/orders']);
    }
  }

  formatDate(date: Date): string {
    if (date == null || date == undefined) {
      return 'N/A';
    }
    date = new Date(date);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatShortDate(date: Date): string {
    if (date == null || date == undefined) {
      return 'N/A';
    }
    date = new Date(date);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getImageUrl(imageId: string) {
    return (
      'http://localhost:8080/ecs-inventory-admin/api/public/images/view/getImageById/' +
      imageId
    );
  }

  getOrderTrackingByOrderItemId(orderItemId: number): OrderTracking {
    var result = this.ordersTracking.filter(
      (ot) => ot.orderItem?.orderItemId == orderItemId
    );
    if (result.length > 1) {
      console.log(result.find((ot) => ot.orderTrackingType == 2));
      return result.find((ot) => ot.orderTrackingType == 2)!;
    } else {
      return result[0];
    }
  }

  getReturnOrderStatusLabel(id: number) {
    return ORDER_RETURN_STATUS_MAP[id];
  }
}
