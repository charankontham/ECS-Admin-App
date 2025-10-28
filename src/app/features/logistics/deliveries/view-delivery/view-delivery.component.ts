import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderTrackingService } from '../../../../core/services/order-tracking.service';
import { DeliveryAgentService } from '../../../../core/services/delivery-agent.service';
import { DeliveryHubService } from '../../../../core/services/delivery-hub.service';
import {
  DeliveryAgent,
  DeliveryHub,
} from '../../../../core/models/delivery.model';
import { MatChipsModule } from '@angular/material/chips';
import {
  CustomerDto,
  OrderTracking,
  OrderTrackingRequest,
} from '../../../../core/models/order.model';
import {
  AVAILABILITY_STATUS_MAP,
  AvailabilityStatusClassMap,
  ORDER_TRACKING_STATUS_MAP,
  OrderStatusClassMap,
} from '../../../../core/util/util';
import { Observable } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerService } from '../../../../core/services/customer.service';

@Component({
  selector: 'app-view-delivery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './view-delivery.component.html',
  styleUrl: './view-delivery.component.css',
})
export class ViewDeliveryComponent implements OnInit {
  orderTracking: OrderTracking | null = null;
  deliveryAgents: DeliveryAgent[] = [];
  deliveryHubs: DeliveryHub[] = [];
  loading = true;
  error: string | null = null;
  statusList = Object.entries(ORDER_TRACKING_STATUS_MAP).map(
    ([key, value]) => ({
      id: Number(key),
      name: value,
    })
  );
  isEditingStatus = false;
  isEditingDate = false;
  selectedStatus: number | null = null;
  selectedDate: Date | null = null;
  showAgentList = false;
  showHubList = false;
  agentSearchText = '';
  hubSearchText = '';
  customerDetails: CustomerDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderTrackingService: OrderTrackingService,
    private deliveryAgentService: DeliveryAgentService,
    private deliveryHubService: DeliveryHubService,
    private snackbar: MatSnackBar,
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const trackingId = params.get('orderTrackingId');
      if (trackingId) {
        this.loadOrderTracking(trackingId);
        this.loadDeliveryAgents();
        this.loadDeliveryHubs();
      } else {
        this.error = 'Tracking ID not found';
        this.loading = false;
      }
    });
  }

  loadOrderTracking(trackingId: string): void {
    this.loading = true;
    this.orderTrackingService.getOrderTrackingById(trackingId).subscribe({
      next: (data) => {
        this.orderTracking = data;
        this.selectedStatus = data.orderTrackingStatusId;
        this.selectedDate = new Date(data.estimatedDeliveryDate);
        this.loadCustomerDetails(
          Number(data?.customerAddress?.userId.substring(9))
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order tracking:', error);
        this.error = 'Failed to load delivery details';
        this.loading = false;
      },
    });
  }

  loadCustomerDetails(customerId: number): void {
    this.customerService.getCustomerById(customerId).subscribe({
      next: (response) => {
        this.customerDetails = response;
      },
      error: (err) => {
        console.log('Error : ', err);
      },
    });
  }

  loadDeliveryAgents(): void {
    this.deliveryAgentService.getAllDeliveryAgents().subscribe({
      next: (agents) => {
        this.deliveryAgents = agents;
      },
      error: (error) => {
        console.error('Error loading delivery agents:', error);
      },
    });
  }

  loadDeliveryHubs(): void {
    this.deliveryHubService.getAllDeliveryHubs().subscribe({
      next: (hubs) => {
        this.deliveryHubs = hubs;
      },
      error: (error) => {
        console.error('Error loading delivery hubs:', error);
      },
    });
  }

  getStatusLabel(statusId: number): string {
    return ORDER_TRACKING_STATUS_MAP[statusId] || 'Unknown';
  }

  getOrderStatusClass(statusId: number): string {
    return OrderStatusClassMap[statusId] || '';
  }
  getAgentStatusClass(statusId: number): string {
    return AvailabilityStatusClassMap[statusId] || '';
  }

  getAvailabilityStatus(statusId: number): string {
    return AVAILABILITY_STATUS_MAP[statusId] || 'Unknown';
  }

  toggleStatusEdit(): void {
    this.isEditingStatus = !this.isEditingStatus;
    if (!this.isEditingStatus) {
      this.selectedStatus = this.orderTracking?.orderTrackingStatusId || null;
    }
  }

  saveStatus(): void {
    if (this.selectedStatus && this.orderTracking) {
      this.loading = true;
      const orderTrackingRequest = this.getUpdatedOrderTrackingRequest(
        'status',
        this.selectedStatus
      );
      this.orderTrackingService
        .updateOrderTracking(orderTrackingRequest)
        .subscribe({
          next: (response) => {
            this.orderTracking = response;
            this.isEditingStatus = false;
            this.loading = false;
            this.snackbar.open(`Order Status updated successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
          },
          error: (err) => {
            console.error('Error : ', err);
            this.snackbar.open(`Failed to update order status date`, 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
    }
  }

  toggleDateEdit(): void {
    this.isEditingDate = !this.isEditingDate;
    if (!this.isEditingDate) {
      this.selectedDate = this.orderTracking
        ? new Date(this.orderTracking.estimatedDeliveryDate)
        : null;
    }
  }

  saveDate(): void {
    if (this.selectedDate && this.orderTracking) {
      this.loading = true;
      const orderTrackingRequest = this.getUpdatedOrderTrackingRequest(
        'date',
        this.selectedDate
      );
      this.orderTrackingService
        .updateOrderTracking(orderTrackingRequest)
        .subscribe({
          next: (response) => {
            this.orderTracking = response;
            this.isEditingDate = false;
            this.loading = false;
            this.snackbar.open(
              `Estimated delivery date updated successfully`,
              'Close',
              {
                duration: 3000,
                panelClass: ['success-snackbar'],
              }
            );
          },
          error: (err) => {
            console.error('Error : ', err);
            this.snackbar.open(
              `Failed to update estimated delivery date`,
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          },
        });
    }
  }

  toggleAgentList(): void {
    this.showAgentList = !this.showAgentList;
    this.agentSearchText = '';
  }

  toggleHubList(): void {
    this.showHubList = !this.showHubList;
    this.hubSearchText = '';
  }

  assignAgent(agent: DeliveryAgent): void {
    if (this.orderTracking) {
      this.loading = true;
      const orderTrackingRequest = this.getUpdatedOrderTrackingRequest(
        'agent',
        agent.deliveryAgentId!
      );
      this.orderTrackingService
        .updateOrderTracking(orderTrackingRequest)
        .subscribe({
          next: (response) => {
            this.orderTracking = response;
            this.showAgentList = false;
            this.loading = false;
            this.snackbar.open(
              `Agent ${agent.deliveryAgentName} assigned successfully`,
              'Close',
              {
                duration: 3000,
                panelClass: ['success-snackbar'],
              }
            );
          },
          error: (err) => {
            console.error('Error : ', err);
            this.snackbar.open(
              `Agent ${agent.deliveryAgentName} failed to assign`,
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          },
        });
    }
  }

  assignHub(hub: DeliveryHub): void {
    if (this.orderTracking) {
      this.loading = true;
      const orderTrackingRequest = this.getUpdatedOrderTrackingRequest(
        'hub',
        hub.deliveryHubId
      );
      this.orderTrackingService
        .updateOrderTracking(orderTrackingRequest)
        .subscribe({
          next: (response) => {
            this.orderTracking = response;
            this.showHubList = false;
            this.loading = false;
            this.snackbar.open(
              `Hub ${hub.deliveryHubName} assigned successfully`,
              'Close',
              {
                duration: 3000,
                panelClass: ['success-snackbar'],
              }
            );
          },
          error: (err) => {
            console.error('Error : ', err);
            this.snackbar.open(
              `Hub ${hub.deliveryHubName} failed to assign`,
              'Close',
              {
                duration: 3000,
                panelClass: ['error-snackbar'],
              }
            );
          },
        });
    }
  }

  get filteredAgents(): DeliveryAgent[] {
    if (!this.agentSearchText) {
      return this.deliveryAgents;
    }
    const search = this.agentSearchText.toLowerCase();
    return this.deliveryAgents.filter(
      (agent) =>
        agent.deliveryAgentName.toLowerCase().includes(search) ||
        agent.deliveryAgentId?.toString().includes(search)
    );
  }

  get filteredHubs(): DeliveryHub[] {
    if (!this.hubSearchText) {
      return this.deliveryHubs;
    }
    const search = this.hubSearchText.toLowerCase();
    return this.deliveryHubs.filter(
      (hub) =>
        hub.deliveryHubName.toLowerCase().includes(search) ||
        hub.deliveryHubId.toString().includes(search) ||
        hub.deliveryHubAddress?.zip?.includes(search)
    );
  }

  formatDate(date: Date | string): string {
    const newDate = new Date(date);
    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goBack(): void {
    this.router.navigate(['/logistics/deliveries']);
  }

  getUpdatedOrderTrackingRequest(
    fieldType: string,
    fieldValue: number | Date
  ): OrderTrackingRequest {
    return {
      ...this.orderTracking,
      orderTrackingId: this.orderTracking!.orderTrackingId,
      productId: this.orderTracking!.product?.productId!,
      orderItemId: this.orderTracking!.orderItem?.orderItemId!,
      deliveryAgentId:
        fieldType == 'agent'
          ? (fieldValue as number)
          : this.orderTracking!.deliveryAgent
          ? this.orderTracking!.deliveryAgent.deliveryAgentId
          : undefined,
      nearestHubId:
        fieldType == 'hub'
          ? (fieldValue as number)
          : this.orderTracking!.nearestHub
          ? this.orderTracking!.nearestHub.deliveryHubId
          : undefined,
      customerAddressId: this.orderTracking!.customerAddress?.addressId!,
      orderTrackingStatusId:
        fieldType == 'status'
          ? (fieldValue as number)
          : this.orderTracking?.orderTrackingStatusId!,
      estimatedDeliveryDate:
        fieldType == 'date'
          ? (fieldValue as Date)
          : this.orderTracking?.estimatedDeliveryDate,
      orderTrackingType: this.orderTracking?.orderTrackingType ?? 1,
    };
  }
}
