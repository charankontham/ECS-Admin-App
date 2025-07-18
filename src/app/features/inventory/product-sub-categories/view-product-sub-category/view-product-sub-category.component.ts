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
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  SubCategory,
  ProductCategory,
  SubCategoryFilters,
} from '../../../../core/models/product-category.model';
import { ProductSubCategoryService } from '../../../../core/services/product-sub-category.service';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { ImageUploaderComponent } from '../../../images/image-uploader/image-uploader.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-view-subcategory',
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
    MatSelectModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    ImageUploaderComponent,
  ],
  templateUrl: './view-product-sub-category.component.html',
  styleUrl: './view-product-sub-category.component.css',
})
export class ViewProductSubCategoryComponent {
  subCategory: SubCategory | null = null;
  categories: ProductCategory[] = [];
  loading = true;
  error: string | null = null;
  isEditMode = false;
  subCategoryForm: FormGroup;
  isNewSubCategory = false;
  currentImageUrl = '';
  filters: SubCategoryFilters = {
    currentPage: 0,
    offset: 5,
    searchValue: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subCategoryService: ProductSubCategoryService,
    private categoryService: ProductCategoryService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.subCategoryForm = this.createSubCategoryForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    this.route.paramMap.subscribe((params) => {
      const subCategoryId = params.get('subCategoryId');
      this.loading = true;
      if (subCategoryId == 'new') {
        this.isNewSubCategory = true;
        this.isEditMode = true;
        this.subCategory = this.createEmptySubCategory();
        this.loading = false;
      } else if (subCategoryId) {
        this.loadSubCategory(parseInt(subCategoryId));
      } else {
        this.error = 'Sub Category ID not found';
        this.loading = false;
      }
    });

    this.subCategoryForm.valueChanges.subscribe((formValues) => {
      this.updateSubCategoryFromForm(formValues);
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories', error);
      },
    });
  }

  loadSubCategory(subCategoryId: number): void {
    this.loading = true;
    this.subCategoryService.getSubCategoryById(subCategoryId).subscribe({
      next: (subCategory) => {
        this.subCategory = subCategory;
        // this.initializeForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading subcategory', error);
        this.error =
          'Failed to load subcategory details. Please try again later.';
        this.loading = false;
      },
    });
  }

  createSubCategoryForm(): FormGroup {
    return this.fb.group({
      subCategoryName: ['', Validators.required],
      subCategoryDescription: ['', Validators.required],
      categoryId: ['', Validators.required],
      subCategoryImage: [''],
    });
  }

  createEmptySubCategory(): SubCategory {
    return {
      subCategoryId: 0,
      categoryId: 0,
      subCategoryName: '',
      subCategoryDescription: '',
      subCategoryImage: '',
    };
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.subCategory) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.subCategory) {
      this.subCategoryForm.patchValue({
        subCategoryName: this.subCategory.subCategoryName,
        subCategoryDescription: this.subCategory.subCategoryDescription,
        categoryId: this.subCategory.categoryId,
        subCategoryImage: this.subCategory.subCategoryImage || '',
      });
    }
  }

  setImageId(imageId: string): void {
    this.subCategoryForm.patchValue({
      subCategoryImage: imageId,
    });
  }

  cancelEdit(): void {
    if (this.isNewSubCategory) {
      this.goBack();
    } else {
      this.isEditMode = false;
      this.subCategoryForm.reset();
    }
  }

  saveSubCategory(): void {
    if (this.subCategoryForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }
    this.loading = true;
    const formValues = this.subCategoryForm.value;
    const subCategoryData: SubCategory = {
      subCategoryId: this.isNewSubCategory
        ? null
        : this.subCategory?.subCategoryId || null,
      categoryId: formValues.categoryId,
      subCategoryName: formValues.subCategoryName,
      subCategoryDescription: formValues.subCategoryDescription,
      subCategoryImage: formValues.subCategoryImage || '',
    };

    if (this.isNewSubCategory) {
      this.subCategoryService.addSubCategory(subCategoryData).subscribe({
        next: (newSubCategory) => {
          this.subCategory = newSubCategory;
          this.isEditMode = false;
          this.isNewSubCategory = false;
          this.handleSnackBarAction('Sub Category created successfully', true);
          this.loading = false;
          this.router.navigate([
            '/inventory/sub-categories',
            this.subCategory.subCategoryId,
          ]);
        },
        error: (error) => {
          console.error('Error creating subcategory', error);
          this.snackBar.open(
            'Failed to create subcategory. Please try again later.',
            'Close',
            {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            }
          );
          this.loading = false;
        },
      });
    } else {
      this.subCategoryService.updateSubCategory(subCategoryData).subscribe({
        next: (updatedSubCategory) => {
          this.subCategory = updatedSubCategory;
          this.isEditMode = false;
          this.handleSnackBarAction('Sub Category updated successfully', true);
          window.location.reload();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating subcategory', error);
          this.handleSnackBarAction(
            'Failed to update sub-category. Please try again later.',
            false
          );
          this.loading = false;
        },
      });
    }
  }

  deleteSubCategory(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Sub Category',
        message: `Are you sure you want to delete the subcategory "${this.subCategory?.subCategoryName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.subCategoryService
          .deleteSubCategoryById(this.subCategory?.subCategoryId || 0)
          .subscribe({
            next: (response: HttpResponse<string>) => {
              if (response.status == 200) {
                this.handleSnackBarAction(
                  'Sub Category deleted successfully',
                  true
                );
                this.isEditMode = false;
                this.loading = false;
                this.router.navigate(['/inventory/sub-categories']);
              } else {
                this.handleSnackBarAction(
                  'Failed to delete sub-category. Please try again later.',
                  false
                );
                this.loading = false;
              }
            },
            error: (error: any) => {
              console.error('Error deleting subcategory', error);
              this.handleSnackBarAction(
                'Failed to delete sub-category. Please try again later.',
                false
              );
              this.loading = false;
            },
          });
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  }

  goBack(): void {
    const referrer = document.referrer;
    if (
      referrer.includes('/inventory/sub-categories') &&
      !referrer.includes('/inventory/sub-categories/')
    ) {
      this.location.back();
    } else {
      this.router.navigate(['/inventory/sub-categories']);
    }
  }

  updateSubCategoryFromForm(formValues: any): void {
    if (this.subCategory) {
      this.subCategory.subCategoryName = formValues.subCategoryName;
      this.subCategory.subCategoryDescription =
        formValues.subCategoryDescription;
      this.subCategory.categoryId = formValues.categoryId;
      this.subCategory.subCategoryImage = formValues.subCategoryImage;
    }
  }

  handleSnackBarAction(message: string, success: boolean): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [success ? 'success-snackbar' : 'error-snackbar'],
    });
  }

  compareCategories = (c1: ProductCategory, c2: ProductCategory) =>
    c1 && c2 && c1.categoryId === c2.categoryId;
}
