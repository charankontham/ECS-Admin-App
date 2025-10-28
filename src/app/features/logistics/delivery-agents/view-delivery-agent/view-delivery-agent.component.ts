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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeliveryAgentService } from '../../../../core/services/delivery-agent.service';
import { OrderTrackingService } from '../../../../core/services/order-tracking.service';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DeliveryAgent } from '../../../../core/models/delivery.model';
import { OrderTracking } from '../../../../core/models/order.model';
import {
  AVAILABILITY_STATUS_MAP,
  AvailabilityStatus,
  AvailabilityStatusClassMap,
  ORDER_TRACKING_STATUS_MAP,
  ORDER_TRACKING_TYPE_MAP,
  OrderStatusClassMap,
} from '../../../../core/util/util';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-view-delivery-agent',
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
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatTableModule,
    MatDialogModule,
  ],
  templateUrl: './view-delivery-agent.component.html',
  styleUrl: './view-delivery-agent.component.css',
})
export class ViewDeliveryAgentComponent implements OnInit {
  agent: DeliveryAgent | null = null;
  currentDeliveries: OrderTracking[] = [];
  loading = true;
  error: string | null = null;
  isEditMode = false;
  isNewAgent = false;
  agentForm: FormGroup;
  passwordForm: FormGroup;
  showPasswordSection = false;
  showDeliveriesSection = false;

  availabilityStatuses = [
    {
      value: AvailabilityStatus.Available,
      label: AVAILABILITY_STATUS_MAP[AvailabilityStatus.Available],
    },
    {
      value: AvailabilityStatus.Busy,
      label: AVAILABILITY_STATUS_MAP[AvailabilityStatus.Busy],
    },
    {
      value: AvailabilityStatus.OnLeave,
      label: AVAILABILITY_STATUS_MAP[AvailabilityStatus.OnLeave],
    },
    {
      value: AvailabilityStatus.Unavailable,
      label: AVAILABILITY_STATUS_MAP[AvailabilityStatus.Unavailable],
    },
  ];

  displayedColumns: string[] = [
    'orderTrackingId',
    'productName',
    'customerAddress',
    'status',
    'trackingType',
    'estimatedDeliveryDate',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deliveryAgentService: DeliveryAgentService,
    private orderTrackingService: OrderTrackingService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.agentForm = this.createAgentForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const agentId = params.get('deliveryAgentId');
      this.loading = true;
      if (agentId === 'new') {
        this.isNewAgent = true;
        this.isEditMode = true;
        this.agent = this.createEmptyAgent();
        this.loading = false;
      } else if (agentId) {
        this.loadAgent(Number.parseInt(agentId));
      } else {
        this.error = 'Agent ID not found';
        this.loading = false;
      }
    });
  }

  createAgentForm(): FormGroup {
    return this.fb.group({
      deliveryAgentName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{10}$/)],
      ],
      servingArea: ['', Validators.required],
      availabilityStatus: [AvailabilityStatus.Available, Validators.required],
      password: [''],
      confirmPassword: [''],
    });
  }

  createPasswordForm(): FormGroup {
    return this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', Validators.required],
    });
  }

  createEmptyAgent(): DeliveryAgent {
    return {
      deliveryAgentName: '',
      email: '',
      contactNumber: '',
      servingArea: '',
      availabilityStatus: AvailabilityStatus.Available,
      totalDeliveries: 0,
      rating: 0,
    };
  }

  loadAgent(agentId: number): void {
    this.loading = true;
    this.deliveryAgentService.getDeliveryAgentById(agentId).subscribe({
      next: (agent) => {
        this.agent = agent;
        this.initializeForm();
        this.loadCurrentDeliveries(agentId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading agent', error);
        this.error = 'Failed to load agent details. Please try again later.';
        this.loading = false;
        this.snackbar.open('Failed to load agent details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  loadCurrentDeliveries(agentId: number): void {
    this.orderTrackingService.getAllOrderTrackingsByAgentId(agentId).subscribe({
      next: (deliveries) => {
        this.currentDeliveries = deliveries;
      },
      error: (error) => {
        console.error('Error loading current deliveries', error);
        this.snackbar.open('Failed to load current deliveries', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  initializeForm(): void {
    if (this.agent) {
      this.agentForm.patchValue({
        deliveryAgentName: this.agent.deliveryAgentName,
        email: this.agent.email,
        contactNumber: this.agent.contactNumber,
        servingArea: this.agent.servingArea,
        availabilityStatus: this.agent.availabilityStatus,
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.agent) {
      this.initializeForm();
    }
    this.showPasswordSection = false;
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordForm.reset();
    }
  }

  saveAgent(): void {
    if (this.agentForm.invalid) {
      this.snackbar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (this.isNewAgent) {
      const password = this.agentForm.get('password')?.value;
      const confirmPassword = this.agentForm.get('confirmPassword')?.value;

      if (!password || password.length < 8) {
        this.snackbar.open('Password must be at least 8 characters', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      if (password !== confirmPassword) {
        this.snackbar.open('Passwords do not match', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }
    }

    this.loading = true;
    const formValues = this.agentForm.value;

    const agentData: DeliveryAgent = {
      deliveryAgentId: this.agent?.deliveryAgentId,
      deliveryAgentName: formValues.deliveryAgentName,
      email: formValues.email,
      contactNumber: formValues.contactNumber,
      servingArea: formValues.servingArea,
      availabilityStatus: formValues.availabilityStatus,
      totalDeliveries: this.agent?.totalDeliveries || 0,
      rating: this.agent?.rating || 0,
      password: this.isNewAgent ? formValues.password : undefined,
    };

    if (this.isNewAgent) {
      this.deliveryAgentService.addDeliveryAgent(agentData).subscribe({
        next: (createdAgent) => {
          this.agent = createdAgent;
          this.isNewAgent = false;
          this.isEditMode = false;
          this.loading = false;
          this.snackbar.open('Delivery agent created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.router.navigate([
            '/logistics/delivery-agents',
            createdAgent.deliveryAgentId,
          ]);
        },
        error: (error) => {
          console.error('Error creating agent', error);
          this.loading = false;
          this.snackbar.open('Failed to create agent', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      this.deliveryAgentService.updateDeliveryAgent(agentData).subscribe({
        next: (updatedAgent) => {
          this.agent = updatedAgent;
          this.isEditMode = false;
          this.loading = false;
          this.snackbar.open(
            'Agent information updated successfully!',
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
        },
        error: (error) => {
          console.error('Error updating agent', error);
          this.loading = false;
          this.snackbar.open('Failed to update agent', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.snackbar.open('Please fill all password fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const oldPassword = this.passwordForm.get('oldPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmNewPassword =
      this.passwordForm.get('confirmNewPassword')?.value;

    if (newPassword !== confirmNewPassword) {
      this.snackbar.open('New passwords do not match', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }
    if (oldPassword == null || oldPassword.trim() == '') {
      this.snackbar.open('Old password is mandatory to update', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.loading = true;
    const passwordData: any = {
      deliveryAgentId: this.agent?.deliveryAgentId,
      oldPassword: oldPassword,
      newPassword: newPassword,
    };

    this.deliveryAgentService.updateAgentPassword(passwordData).subscribe({
      next: (response) => {
        if (typeof response != 'string') {
          this.loading = false;
          this.passwordForm.reset();
          this.showPasswordSection = false;
          this.snackbar.open('Password updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        } else {
          this.loading = false;
          console.error('Failed to update password : ', response);
          this.snackbar.open('Failed to update password!', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      },
      error: (error) => {
        console.error('Error updating password', error);
        this.loading = false;
        this.snackbar.open('Failed to update password', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  cancelEdit(): void {
    if (this.isNewAgent) {
      this.goBack();
    } else {
      this.isEditMode = false;
      this.showPasswordSection = false;
      this.agentForm.reset();
      this.passwordForm.reset();
      this.initializeForm();
    }
  }

  deleteAgent(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Delivery Agent',
        message: `Are you sure you want to delete ${this.agent?.deliveryAgentName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.agent?.deliveryAgentId) {
        this.loading = true;
        this.deliveryAgentService
          .deleteDeliveryAgent(this.agent.deliveryAgentId)
          .subscribe({
            next: (response) => {
              console.log('Delete Response : ', response);
              this.snackbar.open(
                'Delivery agent deleted successfully!',
                'Close',
                {
                  duration: 3000,
                  panelClass: ['success-snackbar'],
                }
              );
              this.loading = false;
              this.router.navigate(['/logistics/delivery-agents']);
            },
            error: (error) => {
              console.error('Error deleting agent', error);
              this.loading = false;
              this.snackbar.open('Failed to delete agent', 'Close', {
                duration: 3000,
                panelClass: ['error-snackbar'],
              });
            },
          });
      }
    });
  }

  onDeliveryClick(delivery: OrderTracking): void {
    this.router.navigate(['/logistics/deliveries', delivery.orderTrackingId]);
  }

  goBack(): void {
    this.router.navigate(['logistics/delivery-agents/']);
    // this.location.back();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    var newDate = new Date(date);
    if (!date.toString().includes('Z')) {
      newDate = new Date(date.toString() + 'Z');
    }
    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getAgentStatusClass(status: number): string {
    return AvailabilityStatusClassMap[status];
  }

  getOrderStatusClass(status: number): string {
    return OrderStatusClassMap[status];
  }

  getOrderStatusLabel(statusId: number): string {
    return ORDER_TRACKING_STATUS_MAP[statusId] || 'Unknown';
  }

  getAvailabilityStatusLabel(statusId: number): string {
    return AVAILABILITY_STATUS_MAP[statusId] || 'Unknown';
  }

  getTrackingTypeLabel(typeId: number): string {
    return ORDER_TRACKING_TYPE_MAP[typeId] || 'Unknown';
  }

  getCustomerAddress(delivery: OrderTracking): string {
    if (!delivery.customerAddress) return 'N/A';
    const addr = delivery.customerAddress;
    return `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${
      addr.zip || ''
    }`.trim();
  }
}
