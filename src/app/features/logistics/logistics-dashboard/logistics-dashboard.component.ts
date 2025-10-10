import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { OrderTrackingService } from '../../../core/services/order-tracking.service';
import { OrderReturnsService } from '../../../core/services/order-return.service';
import { DeliveryAgentService } from '../../../core/services/delivery-agent.service';
import { DeliveryHubService } from '../../../core/services/delivery-hub.service';
import {
  Order,
  OrderFilters,
  OrderReturn,
  OrderReturnFilters,
  OrderTracking,
  OrderTrackingFilters,
} from '../../../core/models/order.model';
import {
  DeliveryAgent,
  DeliveryAgentFilters,
  DeliveryHub,
  DeliveryHubFilters,
} from '../../../core/models/delivery.model';
import {
  AVAILABILITY_STATUS_MAP,
  AvailabilityStatusClassMap,
  ORDER_TRACKING_STATUS_MAP,
  sleep,
} from '../../../core/util/util';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OrderStatusClassMap } from '../../../core/util/util';

interface DashboardStats {
  label: string;
  value: number;
  icon: string;
  color: string;
  trend?: string;
}

@Component({
  selector: 'app-logistics-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatProgressBarModule,
    RouterModule,
  ],
  templateUrl: './logistics-dashboard.component.html',
  styleUrl: './logistics-dashboard.component.css',
})
export class LogisticsDashboardComponent implements OnInit {
  orderService: OrderService;
  orderTrackingService: OrderTrackingService;
  orderReturnService: OrderReturnsService;
  deliveryAgentService: DeliveryAgentService;
  deliveryHubService: DeliveryHubService;
  recentOrders: Order[] = [];
  returnedOrders: OrderReturn[] = [];
  deliveryAgents: DeliveryAgent[] = [];
  deliveryHubs: DeliveryHub[] = [];
  deliveries: OrderTracking[] = [];
  loadingRecentOrders: boolean = true;
  loadingReturnedOrders: boolean = true;
  loadingDeliveryAgents: boolean = true;
  loadingDeliveryHubs: boolean = true;
  loadingDeliveries: boolean = true;
  loadingStats = true;
  stats: DashboardStats[] = [];
  orderDisplayedColumns: string[] = [
    'orderId',
    'customerName',
    'status',
    'deliveryAddress',
    'amount',
  ];
  // deliveryDisplayedColumns: string[] = [
  //   'orderId',
  //   'customerName',
  //   'status',
  //   'deliveryAddress',
  //   'amount',
  // ];
  returnOrderDisplayedColumns: string[] = [
    'returnOrderId',
    'customerName',
    'orderItemId',
    'returnedDate',
    'returnReason',
  ];
  deliveryAgentColumns: string[] = [
    'agentId',
    'agentName',
    'availability',
    'rating',
    'servingArea',
  ];
  deliveryHubColumns: string[] = ['hubId', 'hubName', 'address', 'dateAdded'];
  deliveryColumns: string[] = [
    'orderTrackingId',
    'deliveryAgent',
    'product',
    'estimatedDeliveryDate',
    'trackingStatus',
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    orderService: OrderService,
    private router: Router,
    orderTrackingService: OrderTrackingService,
    orderReturnService: OrderReturnsService,
    deliveryAgentService: DeliveryAgentService,
    deliveryHubService: DeliveryHubService
  ) {
    this.platformId = platformId;
    this.orderService = orderService;
    this.orderTrackingService = orderTrackingService;
    this.orderReturnService = orderReturnService;
    this.deliveryAgentService = deliveryAgentService;
    this.deliveryHubService = deliveryHubService;
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentOrders();
    this.loadReturnedOrders();
    this.loadDeliveries();
    this.loadDeliveryAgents();
    this.loadDeliveryHubs();
  }

  loadStats(): void {
    this.loadingStats = true;
    setTimeout(() => {
      this.stats = [
        {
          label: 'Total Orders',
          value: 1245,
          icon: 'shopping_cart',
          color: '#3b82f6',
          trend: '+12.5%',
        },
        {
          label: 'Pending Deliveries',
          value: 87,
          icon: 'local_shipping',
          color: '#f59e0b',
          trend: '+5.2%',
        },
        {
          label: 'Completed Today',
          value: 156,
          icon: 'check_circle',
          color: '#10b981',
          trend: '+8.3%',
        },
        {
          label: 'Active Agents',
          value: 42,
          icon: 'person',
          color: '#8b5cf6',
          trend: '+2',
        },
        {
          label: 'Return Orders',
          value: 23,
          icon: 'assignment_return',
          color: '#ef4444',
          trend: '-3.1%',
        },
        {
          label: 'Delivery Hubs',
          value: 8,
          icon: 'store',
          color: '#06b6d4',
          trend: '0',
        },
      ];
      this.loadingStats = false;
    }, 1000);
  }

  loadRecentOrders(): void {
    this.loadingRecentOrders = true;
    const filters: OrderFilters = {
      type: 'order',
      currentPage: 0,
      offset: 10,
    };
    this.orderService.getAllOrdersBypagination(filters).subscribe((orders) => {
      this.recentOrders = orders.content;
      this.loadingRecentOrders = false;
    });
  }

  loadReturnedOrders(): void {
    this.loadingReturnedOrders = true;
    const filters: OrderReturnFilters = {
      type: 'orderReturn',
      currentPage: 0,
      offset: 10,
    };
    this.orderReturnService
      .getAllOrderReturnsBypagination(filters)
      .subscribe((returns: any) => {
        if (returns.totalCount > 0) {
          this.returnedOrders = returns.items;
        }
        this.loadingReturnedOrders = false;
      });
  }

  loadDeliveryAgents(): void {
    this.loadingDeliveryAgents = true;
    const filters: DeliveryAgentFilters = {
      type: 'deliveryAgent',
      currentPage: 0,
      offset: 10,
    };
    this.deliveryAgentService
      .getAllDeliveryAgentsBypagination(filters)
      .subscribe((agents) => {
        this.deliveryAgents = agents.items;
        this.loadingDeliveryAgents = false;
      });
  }

  loadDeliveryHubs(): void {
    this.loadingDeliveryHubs = true;
    const filters: DeliveryHubFilters = {
      type: 'deliveryHub',
      currentPage: 0,
      offset: 10,
    };
    this.deliveryHubService
      .getAllDeliveryHubsBypagination(filters)
      .subscribe((hubs) => {
        this.deliveryHubs = hubs.items;
        this.loadingDeliveryHubs = false;
      });
  }

  loadDeliveries(): void {
    this.loadingDeliveries = true;
    const filters: OrderTrackingFilters = {
      type: 'orderTracking',
      currentPage: 0,
      offset: 10,
    };
    this.orderTrackingService
      .getAllOrderTrackingsBypagination(filters)
      .subscribe((deliveries) => {
        this.deliveries = deliveries.items;
        this.loadingDeliveries = false;
      });
  }

  getOrderStatusValue(statusId: number): string {
    return ORDER_TRACKING_STATUS_MAP[statusId] || 'Unknown Status';
  }

  getAvailabilityStatusValue(statusId: number): string {
    return AVAILABILITY_STATUS_MAP[statusId] || 'Unknown Status';
  }

  getStatusClass(status: number): string {
    return OrderStatusClassMap[status] || '';
  }

  getAvailabilityStatusClass(status: number): string {
    return AvailabilityStatusClassMap[status] || '';
  }

  onLinkClick(path: string, id: number | string): void {
    this.router.navigate([path, id]);
  }
}
