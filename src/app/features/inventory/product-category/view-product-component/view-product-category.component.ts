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
import { MatChipsModule } from '@angular/material/chips';
import {
  ProductCategory,
  SubCategory,
} from '../../../../core/models/product-category.model';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { ProductSubCategoryService } from '../../../../core/services/product-sub-category.service';
import { ImageUploaderComponent } from '../../../images/image-uploader/image-uploader.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageDoc } from '../../../../core/models/image.model';
import { ImageService } from '../../../../core/services/image.service';
import { catchError, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-view-product-category',
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
    MatChipsModule,
    ImageUploaderComponent,
  ],
  templateUrl: './view-product-category.component.html',
  styleUrl: './view-product-category.component.css',
})
export class ViewProductCategory {
  category: ProductCategory | null = null;
  subCategories: SubCategory[] = [];
  loading = true;
  error: string | null = null;
  isEditMode = false;
  categoryForm: FormGroup;
  isNewCategory = false;
  currentImageUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: ProductCategoryService,
    private subCategoryService: ProductSubCategoryService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private location: Location,
    private imageService: ImageService
  ) {
    this.categoryForm = this.createCategoryForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const categoryId = params.get('productCategoryId');
      this.loading = true;
      if (categoryId == 'new') {
        this.isNewCategory = true;
        this.isEditMode = true;
        this.category = this.createEmptyCategory();
        this.loading = false;
      } else if (categoryId) {
        this.loadCategory(Number.parseInt(categoryId));
      } else {
        this.error = 'Category ID not found';
        this.loading = false;
      }
    });

    this.categoryForm.valueChanges.subscribe((formValues) => {
      this.updateCategoryFromForm(formValues);
    });
  }

  loadCategory(categoryId: number): void {
    this.loading = true;
    this.categoryService.getByCategoryId(categoryId).subscribe({
      next: (category: ProductCategory) => {
        this.category = category;
        this.loadSubCategories(categoryId);
        this.setImageUrl(category.categoryImage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading category', error);
        this.error = 'Failed to load category details. Please try again later.';
        this.loading = false;
      },
    });
  }

  loadSubCategories(categoryId: number): void {
    this.subCategoryService.getSubCategoriesByCategoryId(categoryId).subscribe({
      next: (subCategories) => {
        this.subCategories = subCategories.slice(0, 6); // Limit to 5 subcategories
      },
      error: (error) => {
        console.error('Error loading subcategories', error);
      },
    });
  }

  createCategoryForm(): FormGroup {
    return this.fb.group({
      categoryName: ['', Validators.required],
      categoryImage: [''],
    });
  }

  createEmptyCategory(): ProductCategory {
    return {
      categoryId: null,
      categoryName: '',
      categoryImage: '',
    };
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode && this.category) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.category) {
      this.categoryForm.patchValue({
        categoryName: this.category.categoryName,
        categoryImage: this.category.categoryImage || '',
      });
    }
  }

  setImageId(imageId: string): void {
    console.log('setImageId called with imageId:', imageId);
    this.categoryForm.patchValue({
      categoryImage: imageId,
    });
  }

  cancelEdit(): void {
    if (this.isNewCategory) {
      this.goBack();
    } else {
      this.isEditMode = false;
      this.categoryForm.reset();
    }
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    const formValues = this.categoryForm.value;
    const categoryData: ProductCategory = {
      categoryId: this.isNewCategory ? null : this.category?.categoryId || null,
      categoryName: formValues.categoryName,
      categoryImage: formValues.categoryImage || '',
    };

    this.loading = true;
    if (this.isNewCategory) {
      this.categoryService.addCategory(categoryData).subscribe({
        next: (newCategory) => {
          this.handleSuccessSnackBar('Category Added Successfully!');
          this.category = newCategory;
          this.isEditMode = false;
          this.isNewCategory = false;
          this.loading = false;
          this.router.navigate([
            '/inventory/categories',
            newCategory.categoryId,
          ]);
        },
        error: (error) => {
          console.error('Error creating category', error);
          this.handleFailureSnackBar(
            'Failed to create category. Please try again.'
          );
          this.loading = false;
        },
      });
    } else {
      this.categoryService.updateCategory(categoryData).subscribe({
        next: (updatedCategory) => {
          this.handleSuccessSnackBar('Category updated successfully!');
          this.category = updatedCategory;
          this.isEditMode = false;
          this.loading = false;
          window.location.reload();
        },
        error: (error) => {
          console.error('Error updating category', error);
          this.handleFailureSnackBar(
            'Failed to update category. Please try again.'
          );
          this.loading = false;
        },
      });
    }
  }

  deleteCategory(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Category',
        message: `Are you sure you want to delete the category "${this.category?.categoryName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        setTimeout(() => {
          this.snackBar.open('Category deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          this.loading = false;
          this.router.navigate(['/inventory/categories']);
        }, 1000);
      }
    });
  }

  onSubCategoryClick(subCategory: SubCategory): void {
    this.router.navigate([
      '/inventory/sub-categories',
      subCategory.subCategoryId,
    ]);
  }

  goBack(): void {
    const referrer = document.referrer;
    if (
      referrer.includes('/inventory/categories') &&
      !referrer.includes('/inventory/categories/')
    ) {
      this.location.back();
    } else {
      this.router.navigate(['/inventory/categories']);
    }
  }

  updateCategoryFromForm(formValues: any): void {
    if (this.category) {
      this.category.categoryName = formValues.categoryName;
      this.category.categoryImage = formValues.categoryImage;
    }
  }

  setImageUrl(imageId: string): void {
    if (!imageId) {
      this.currentImageUrl = '/assets/images/image-placeholder.jpg';
      return;
    }
    this.imageService.getImageById(imageId).subscribe({
      next: (image: ImageDoc) => {
        this.currentImageUrl = `data:${image.contentType};base64,${image.image}`;
      },
      error: (error) => {
        console.log('error');
        this.currentImageUrl = '/assets/images/image-placeholder.jpg';
      },
    });
  }

  getImageUrl(imageId: string): Observable<string> {
    console.log('getImageUrl called with imageId:', imageId);
    if (!imageId) {
      return of('/assets/images/image-placeholder.jpg');
    }

    return this.imageService.getImageById(imageId).pipe(
      map(
        (image: ImageDoc) => `data:${image.contentType};base64,${image.image}`
      ),
      catchError((error) => {
        console.error('Error loading image', error);
        return of('/assets/images/image-placeholder.jpg');
      })
    );
  }

  handleFailureSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  handleSuccessSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }
}
