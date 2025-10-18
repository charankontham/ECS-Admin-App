import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { AddressService } from '../../../../core/services/address.service';
import { DeliveryHubService } from '../../../../core/services/delivery-hub.service';
import {
  DeliveryHub,
  DeliveryHubRequest,
} from '../../../../core/models/delivery.model';
import { AddressDto } from '../../../../core/models/common.model';
import { MatSelectModule } from '@angular/material/select';
import { filter, Observable, of, pairwise } from 'rxjs';

@Component({
  selector: 'app-view-delivery-hub',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    MatChipsModule,
  ],
  templateUrl: './view-delivery-hub.component.html',
  styleUrl: './view-delivery-hub.component.css',
})
export class ViewDeliveryHubComponent implements OnInit {
  hub: DeliveryHub | DeliveryHubRequest | null = null;
  hubAddress: AddressDto | null = null;
  isLoading = true;
  error: string | null = null;
  isEditMode = false;
  isNewHub = false;
  isAddingAddress = false;
  isEditingAddress = false;
  hubForm: FormGroup;
  addressForm: FormGroup;
  addressList: string[] = [];
  isHubUpdated: boolean = false;
  previousUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private location: Location,
    private addressService: AddressService,
    private deliveryHubService: DeliveryHubService
  ) {
    this.hubForm = this.createHubForm();
    this.addressForm = this.createAddressForm();
  }

  ngOnInit(): void {
    this.loadAddressList().subscribe((data) => {
      this.addressList = data.list;
    });
    this.route.paramMap.subscribe((params) => {
      const hubId = params.get('deliveryHubId');
      this.isLoading = true;
      if (hubId === 'new') {
        this.isNewHub = true;
        this.isEditMode = true;
        this.hub = this.createEmptyHub();
        this.isLoading = false;
      } else if (hubId) {
        this.loadHub(Number(hubId));
      } else {
        this.error = 'Hub ID not found';
        this.isLoading = false;
      }
    });
  }

  loadAddressList(): Observable<any> {
    return of({
      list: ['FL', 'AZ', 'NJ', 'NY', 'CA', 'GA', 'TX'],
    });
  }

  createHubForm(): FormGroup {
    return this.fb.group({
      hubName: ['', Validators.required],
    });
  }

  createAddressForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      country: ['', Validators.required],
      contact: ['', Validators.required],
    });
  }

  createEmptyHub(): DeliveryHubRequest {
    return {
      deliveryHubName: '',
      dateAdded: new Date(),
      dateModified: new Date(),
    };
  }

  loadHub(hubId: number): void {
    this.isLoading = true;
    this.deliveryHubService.getDeliveryHubById(hubId).subscribe({
      next: (response) => {
        this.hub = response;
        this.initializeHubForm();
        this.hubAddress = response.deliveryHubAddress ?? null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load the delivery hub : ', err);
        this.isLoading = false;
      },
    });
  }

  initializeHubForm(): void {
    if (this.hub) {
      this.hubForm.patchValue({
        hubName: this.hub.deliveryHubName,
      });
    }
  }

  initializeAddressForm(): void {
    if (this.hubAddress) {
      this.addressForm.patchValue({
        name: this.hubAddress.name,
        street: this.hubAddress.street,
        city: this.hubAddress.city,
        state: this.hubAddress.state,
        zip: this.hubAddress.zip,
        country: this.hubAddress.country,
        contact: this.hubAddress.contact,
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.hub) {
      this.initializeHubForm();
    }
  }

  cancelEdit(): void {
    if (this.isNewHub) {
      this.goBack();
    } else {
      this.isEditMode = false;
      this.hubForm.reset();
      this.initializeHubForm();
    }
  }

  saveHub(): void {
    this.isLoading = true;
    if (this.isNewHub && this.isEditMode && this.hubForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    const formValues = this.hubForm.value;
    const hubData: DeliveryHubRequest = {
      deliveryHubId: this.isNewHub ? undefined : this.hub?.deliveryHubId,
      deliveryHubName: this.isNewHub
        ? formValues.hubName
        : this.hub?.deliveryHubName,
      dateAdded: this.hub?.dateAdded ?? new Date(),
      dateModified: new Date(),
      deliveryHubAddressId: this.hub?.deliveryHubAddressId ?? undefined,
    };

    if (this.isNewHub) {
      this.deliveryHubService.addDeliveryHub(hubData).subscribe({
        next: (response) => {
          this.hub = response;
          this.isEditMode = false;
          this.isNewHub = false;
          this.snackBar.open('Delivery Hub created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.router.navigate([
            '/logistics/delivery-hubs',
            this.hub.deliveryHubId,
          ]);
        },
        error: (err) => {
          console.error('Failed to create the hub : ', err);
          this.snackBar.open('Failed to create delivery hub', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    } else {
      this.deliveryHubService.updateDeliveryHub(hubData).subscribe({
        next: (response) => {
          this.hub = response;
          this.isEditMode = false;
          this.snackBar.open('Delivery Hub updated successfully', 'Close', {
            duration: 2000,
            panelClass: ['success-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          console.error('Failed to updated the hub : ', err);
          this.snackBar.open('Failed to create delivery hub', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
    this.isLoading = false;
  }

  deleteHub(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Delivery Hub!',
        message: `Are you sure you want to delete the hub "${this.hub?.deliveryHubName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.deliveryHubService
          .deleteDeliveryHub(this.hub?.deliveryHubId ?? 0)
          .subscribe({
            next: (response) => {
              console.log('Delete response : ', response);
              this.snackBar.open(
                'Delivery Hub deleted successfully!',
                'Close',
                {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                  panelClass: ['success-snackbar'],
                }
              );
              this.isLoading = false;
              this.router.navigate(['/logistics/delivery-hubs']);
            },
            error: (err) => {
              console.error('Failed to delete hub : ', err);
              this.snackBar.open('Failed to delete delivery hub!', 'Close', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
              });
              this.isLoading = false;
            },
          });
      }
    });
  }

  startAddingAddress(): void {
    this.isAddingAddress = true;
    this.addressForm.reset();
  }

  startEditingAddress(): void {
    this.isEditingAddress = true;
    this.initializeAddressForm();
  }

  cancelAddress(): void {
    this.isAddingAddress = false;
    this.isEditingAddress = false;
    this.addressForm.reset();
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.snackBar.open('Please fill all required address fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }
    const formValues = this.addressForm.value;
    this.isLoading = true;
    const addressData: AddressDto = {
      userId: 'admin_' + this.hub?.deliveryHubId,
      addressId: this.hubAddress?.addressId,
      ...formValues,
    };
    if (this.isAddingAddress) {
      this.addressService.addAddress(addressData).subscribe({
        next: (response) => {
          if (this.hub) {
            this.hub.deliveryHubAddressId = response.addressId;
            this.hubAddress = response;
            this.saveHub();
            this.snackBar.open('Address addedd successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            });
          }
        },
        error: (err) => {
          console.error('Failed to add address : ', err);
          this.snackBar.open('Failed to add address', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
      this.isLoading = false;
      this.isAddingAddress = false;
      this.isEditingAddress = false;
    } else {
      this.addressService.updateAddress(addressData).subscribe({
        next: (value) => {
          this.hubAddress = value;
          this.snackBar.open('Address updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        },
        error: (err) => {
          console.error('Failed to updated address: ', err);
          this.snackBar.open('Failed to add address', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
      this.isLoading = false;
      this.isAddingAddress = false;
      this.isEditingAddress = false;
    }
  }

  deleteAddress(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Address',
        message:
          'Are you sure you want to delete this address? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        console.log(this.hub);
        if (this.hub && (this.hub as DeliveryHub).deliveryHubAddress) {
          this.hub.deliveryHubAddressId = null;
          this.isHubUpdated = false;
          this.saveHub();
        }
        this.addressService
          .deleteAddress(this.hubAddress?.addressId || 0)
          .subscribe({
            next: (response) => {
              this.hubAddress = null;
              this.snackBar.open('Address deleted successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              });
            },
            error: (response) => {
              console.error('Failed to delete the address: ', response);
              this.snackBar.open('Failed to delete address!', 'Close', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['error-snackbar'],
              });
            },
          });
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/logistics/delivery-hubs']);
    // this.location.back();
  }

  formatDate(date: string): string {
    const newDate = new Date(date);
    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
