import { Component } from '@angular/core';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductBrand } from '../../../../core/models/product-brand.model';
import { ProductBrandService } from '../../../../core/services/product-brand.service';
import { ImageUploaderComponent } from '../../../images/image-uploader/image-uploader.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-view-brand',
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
    MatTabsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './view-brand.component.html',
  styleUrl: './view-brand.component.css',
})
export class ViewBrandComponent {
  brand: ProductBrand | null = null;
  loading = true;
  error: string | null = null;
  isEditMode = false;
  brandForm: FormGroup;
  isNewBrand = false;
  currentImageUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private brandService: ProductBrandService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.brandForm = this.createBrandForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const brandId = params.get('brandId');
      this.loading = true;
      if (brandId == 'new') {
        this.isNewBrand = true;
        this.isEditMode = true;
        this.brand = this.createEmptyBrand();
        this.loading = false;
      } else if (brandId) {
        this.loadBrand(parseInt(brandId));
      } else {
        this.error = 'Brand ID not found';
        this.loading = false;
      }
    });

    this.brandForm.valueChanges.subscribe((formValues) => {
      this.updateBrandFromForm(formValues);
    });
  }

  loadBrand(brandId: number): void {
    this.loading = true;
    this.brandService.getByBrandId(brandId).subscribe({
      next: (brand) => {
        if (brand) {
          this.brand = brand;
          this.initializeForm();
          this.loading = false;
        } else {
          this.error = 'Brand not found';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading brand', error);
        this.error = 'Failed to load brand details. Please try again later.';
        this.loading = false;
      },
    });
  }

  createBrandForm(): FormGroup {
    return this.fb.group({
      brandName: ['', Validators.required],
      brandDescription: [''],
    });
  }

  createEmptyBrand(): ProductBrand {
    return {
      brandId: null,
      brandName: '',
      brandDescription: '',
    };
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.brand) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.brand) {
      this.brandForm.patchValue({
        brandName: this.brand.brandName,
        brandDescription: this.brand.brandDescription,
      });
    }
  }

  cancelEdit(): void {
    if (this.isNewBrand) {
      this.goBack();
    } else {
      this.isEditMode = false;
      this.brandForm.reset();
    }
  }

  saveBrand(): void {
    this.loading = true;
    if (this.brandForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }
    const formValues = this.brandForm.value;
    const brandData: ProductBrand = {
      brandId: this.isNewBrand ? null : this.brand?.brandId || null,
      brandName: formValues.brandName,
      brandDescription: formValues.brandDescription,
    };
    if (this.isNewBrand) {
      this.brandService.addBrand(brandData).subscribe({
        next: (newBrand) => {
          this.loading = false;
          this.brand = newBrand;
          this.isEditMode = false;
          this.isNewBrand = false;
          this.snackBar.open('Brand created successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.router.navigate(['/inventory/brands', newBrand.brandId]);
        },
        error: (error) => {
          console.error('Error creating brand', error);
          this.handleErrorSnackBar(
            'Failed to create brand. Please try again later.'
          );
          this.loading = false;
        },
      });
    } else {
      this.brandService.updateBrand(brandData).subscribe({
        next: (updatedBrand) => {
          this.loading = false;
          this.brand = updatedBrand;
          this.isEditMode = false;
          this.snackBar.open('Brand updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          window.location.reload();
        },
        error: (error) => {
          console.error('Error updating brand', error);
          this.handleErrorSnackBar(
            'Failed to update brand. Please try again later.'
          );
          this.loading = false;
        },
      });
    }
  }

  deleteBrand(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Brand',
        message: `Are you sure you want to delete the brand "${this.brand?.brandName}"? This action cannot be undone!`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.brandService.deleteBrand(this.brand?.brandId || 0).subscribe({
          next: (response: HttpResponse<string>) => {
            if (response.status == 200) {
              this.loading = false;
              this.snackBar.open('Brand deleted successfully!', 'Close', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['success-snackbar'],
              });
              this.router.navigate(['/inventory/brands']);
            } else {
              this.loading = false;
              this.handleErrorSnackBar(
                response.body ||
                  'Failed to delete brand. Please try again later.'
              );
            }
          },
          error: (error) => {
            console.error('Error deleting brand', error);
            this.handleErrorSnackBar(
              'Failed to delete brand. Please try again later.'
            );
            this.loading = false;
          },
        });
      }
    });
  }

  goBack(): void {
    const referrer = document.referrer;
    if (
      referrer.includes('/inventory/brands') &&
      !referrer.includes('/inventory/brands/')
    ) {
      this.location.back();
    } else {
      this.router.navigate(['/inventory/brands']);
    }
  }

  updateBrandFromForm(formValues: any): void {
    if (this.brand) {
      this.brand.brandName = formValues.brandName;
      this.brand.brandDescription = formValues.brandDescription;
    }
  }

  handleErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
