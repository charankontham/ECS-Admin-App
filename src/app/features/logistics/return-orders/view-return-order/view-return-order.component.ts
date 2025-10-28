import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  DeliveryAgent,
  DeliveryHub,
} from '../../../../core/models/delivery.model';
import { OrderReturnsService } from '../../../../core/services/order-return.service';
import { OrderTrackingService } from '../../../../core/services/order-tracking.service';
import { DeliveryAgentService } from '../../../../core/services/delivery-agent.service';
import { DeliveryHubService } from '../../../../core/services/delivery-hub.service';
import { MatChipsModule } from '@angular/material/chips';
import {
  OrderReturn,
  OrderTracking,
  OrderTrackingRequest,
} from '../../../../core/models/order.model';
import {
  AVAILABILITY_STATUS_MAP,
  AvailabilityStatusClassMap,
  ORDER_RETURN_STATUS_MAP,
  ORDER_TRACKING_STATUS_MAP,
  OrderStatusClassMap,
  PAYMENT_METHOD_MAP,
  RETURN_REASON_CATEGORY_MAP,
} from '../../../../core/util/util';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-view-return-order',
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
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
  ],
  templateUrl: './view-return-order.component.html',
  styleUrl: './view-return-order.component.css',
})
export class ViewReturnOrderComponent implements OnInit {
  returnOrder: OrderReturn | null = null;
  orderTracking: OrderTracking | null = null;
  loading = true;
  error: string | null = null;
  isEditMode = false;
  returnOrderForm: FormGroup;

  // Lists for assignment
  availableAgents: DeliveryAgent[] = [];
  availableHubs: DeliveryHub[] = [];
  showAgentList = false;
  showHubList = false;

  // Status maps
  statusOptions = Object.entries(ORDER_RETURN_STATUS_MAP).map(
    ([key, value]) => ({
      value: Number(key),
      label: value,
    })
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private returnOrderService: OrderReturnsService,
    private orderTrackingService: OrderTrackingService,
    private deliveryAgentService: DeliveryAgentService,
    private deliveryHubService: DeliveryHubService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private location: Location
  ) {
    this.returnOrderForm = this.createReturnOrderForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const returnOrderId = params.get('returnOrderId');
      if (returnOrderId) {
        this.loadReturnOrder(returnOrderId);
      } else {
        this.error = 'Return Order ID not found';
        this.loading = false;
      }
    });

    this.loadAvailableAgents();
    this.loadAvailableHubs();
  }

  createReturnOrderForm(): FormGroup {
    return this.fb.group({
      orderTrackingStatusId: ['', Validators.required],
      estimatedDeliveryDate: ['', Validators.required],
    });
  }

  loadReturnOrder(returnOrderId: string): void {
    this.loading = true;
    this.returnOrderService.getOrderReturnById(returnOrderId).subscribe({
      next: (returnOrder) => {
        this.returnOrder = returnOrder;
        this.orderTracking = returnOrder.orderTracking || null;
        this.initializeForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading return order', error);
        this.error = 'Failed to load return order details. Please try again.';
        this.loading = false;
        this.snackbar.open('Failed to load return order details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  loadAvailableAgents(): void {
    this.deliveryAgentService.getAllDeliveryAgents().subscribe({
      next: (agents) => {
        this.availableAgents = agents;
      },
      error: (error) => {
        console.error('Error loading agents', error);
      },
    });
  }

  loadAvailableHubs(): void {
    this.deliveryHubService.getAllDeliveryHubs().subscribe({
      next: (hubs) => {
        this.availableHubs = hubs;
      },
      error: (error) => {
        console.error('Error loading hubs', error);
      },
    });
  }

  initializeForm(): void {
    if (this.orderTracking) {
      this.returnOrderForm.patchValue({
        orderTrackingStatusId: this.orderTracking.orderTrackingStatusId,
        estimatedDeliveryDate: this.orderTracking.estimatedDeliveryDate,
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.initializeForm();
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.showAgentList = false;
    this.showHubList = false;
    this.returnOrderForm.reset();
    this.initializeForm();
  }

  saveChanges(): void {
    if (this.returnOrderForm.invalid || !this.orderTracking) {
      this.snackbar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const formValues = this.returnOrderForm.value;
    const updatedOrderTracking: OrderTrackingRequest = {
      ...this.getUpdatedOrderTrackingRequest(
        'date',
        formValues.estimatedDeliveryDate
      ),
      orderTrackingStatusId: formValues.orderTrackingStatusId,
    };

    this.loading = true;
    this.orderTrackingService
      .updateOrderTracking(updatedOrderTracking)
      .subscribe({
        next: (updated) => {
          this.orderTracking = updated;
          if (this.returnOrder) {
            this.returnOrder.orderTracking = updated;
          }
          this.isEditMode = false;
          this.loading = false;
          this.snackbar.open('Return order updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: (error) => {
          console.error('Error updating return order', error);
          this.loading = false;
          this.snackbar.open('Failed to update return order', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  toggleAgentList(): void {
    this.showAgentList = !this.showAgentList;
    if (this.showAgentList) {
      this.showHubList = false;
    }
  }

  toggleHubList(): void {
    this.showHubList = !this.showHubList;
    if (this.showHubList) {
      this.showAgentList = false;
    }
  }

  assignAgent(agent: DeliveryAgent): void {
    if (!this.orderTracking) return;

    const updatedOrderTracking = this.getUpdatedOrderTrackingRequest(
      'agent',
      agent.deliveryAgentId!
    );

    this.loading = true;
    this.orderTrackingService
      .updateOrderTracking(updatedOrderTracking)
      .subscribe({
        next: (updated) => {
          this.orderTracking = updated;
          if (this.returnOrder) {
            this.returnOrder.orderTracking = updated;
          }
          this.showAgentList = false;
          this.loading = false;
          this.snackbar.open('Delivery agent assigned successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: (error) => {
          console.error('Error assigning agent', error);
          this.loading = false;
          this.snackbar.open('Failed to assign delivery agent', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  assignHub(hub: DeliveryHub): void {
    if (!this.orderTracking) return;

    const updatedOrderTracking: OrderTrackingRequest =
      this.getUpdatedOrderTrackingRequest('hub', hub.deliveryHubId);

    this.loading = true;
    this.orderTrackingService
      .updateOrderTracking(updatedOrderTracking)
      .subscribe({
        next: (updated) => {
          this.orderTracking = updated;
          if (this.returnOrder) {
            this.returnOrder.orderTracking = updated;
          }
          this.showHubList = false;
          this.loading = false;
          this.snackbar.open('Delivery hub assigned successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: (error) => {
          console.error('Error assigning hub', error);
          this.loading = false;
          this.snackbar.open('Failed to assign delivery hub', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  isAgentAssigned(agent: DeliveryAgent): boolean {
    return (
      this.orderTracking?.deliveryAgent?.deliveryAgentId ===
      agent.deliveryAgentId
    );
  }

  isHubAssigned(hub: DeliveryHub): boolean {
    return this.orderTracking?.nearestHub?.deliveryHubId === hub.deliveryHubId;
  }

  getStatusLabel(statusId: number): string {
    return ORDER_RETURN_STATUS_MAP[statusId] || 'Unknown';
  }

  getOrderStatusClass(statusId: number): string {
    return OrderStatusClassMap[statusId] || 'Unknown';
  }

  getAvailabilityStatusLabel(statusId: number): string {
    return AVAILABILITY_STATUS_MAP[statusId] || 'Unknown';
  }

  getAvailabilityStatusClass(statusId: number): string {
    return AvailabilityStatusClassMap[statusId];
  }

  getProductImageUrl(imageId: string | undefined): string {
    if (!imageId) {
      return '/placeholder.svg?height=150&width=150&text=No+Image';
    }
    return `http://localhost:8080/ecs-inventory-admin/api/public/images/view/getImageById/${imageId}`;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getElementUrl(type: string, id: number): string {
    return this.router.serializeUrl(
      this.router.createUrlTree([
        '/logistics/' + type === 'agent'
          ? 'delivery-agents/'
          : 'delivery-hubs/',
        id,
      ])
    );
  }

  onElementClick(event: MouseEvent, type: string, id: number): void {
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      return;
    }
    this.router.navigate([
      '/logistics/' + type === 'agent' ? 'delivery-agents/' : 'delivery-hubs/',
      id,
    ]);
    event.preventDefault();
  }

  getPaymentSourceLabel(id: number): string {
    return PAYMENT_METHOD_MAP[id];
  }

  getReturnCategoryLabel(id: number): string {
    return RETURN_REASON_CATEGORY_MAP[id];
  }

  goBack(): void {
    this.location.back();
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
