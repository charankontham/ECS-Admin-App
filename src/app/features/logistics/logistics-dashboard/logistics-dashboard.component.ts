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
  ORDER_TRACKING_STATUS_MAP,
} from '../../../core/models/constants.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-logistics-dashboard',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
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
    this.loadRecentOrders();
    this.loadReturnedOrders();
    this.loadDeliveries();
    this.loadDeliveryAgents();
    this.loadDeliveryHubs();
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
}
