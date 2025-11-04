import { Component, ElementRef, ViewChild, type OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Product, ProductRequest } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ProductSubCategoryService } from '../../../../core/services/product-sub-category.service';
import {
  ProductCategory,
  SubCategory,
} from '../../../../core/models/product-category.model';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { ProductBrandService } from '../../../../core/services/product-brand.service';
import { ProductBrand } from '../../../../core/models/product-brand.model';
import { ImageUploaderComponent } from '../../../images/image-uploader/image-uploader.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';
import { ImageService } from '../../../../core/services/image.service';
import { ImageDoc } from '../../../../core/models/image.model';

@Component({
  selector: 'app-view-product',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    ImageUploaderComponent,
  ],
  templateUrl: './view-product.component.html',
  styleUrl: './view-product.component.css',
})
export class ViewProductComponent {
  product: Product | null = null;
  loading = true;
  error: string | null = null;
  isEditMode = false;
  productForm: FormGroup;
  isNewProduct = false;
  imageUploading = false;
  selectedFile: File | null = null;
  categories: ProductCategory[] = [];
  subCategories: SubCategory[] = [];
  brands: ProductBrand[] = [];
  currentImageUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private categoryService: ProductCategoryService,
    private brandService: ProductBrandService,
    private subCategoryService: ProductSubCategoryService,
    private dialog: MatDialog,
    private imageService: ImageService,
    private location: Location
  ) {
    this.productForm = this.createProductForm();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('productId');
      this.loading = true;
      if (productId == 'new') {
        this.isNewProduct = true;
        this.isEditMode = true;
        this.product = this.createEmptyProduct();
        this.loading = false;
      } else if (productId) {
        this.loadProduct(parseInt(productId));
      } else {
        this.error = 'Product ID not found';
        this.loading = false;
      }
    });

    this.productForm
      .get('productCategory')
      ?.valueChanges.subscribe((category: ProductCategory) => {
        this.loadSubCategories(category.categoryId || 0);
        if (!category) {
          this.productForm.get('subCategory')?.setValue('');
        }
      });

    this.productForm.valueChanges.subscribe((formValues) => {
      this.updateProductFromForm(formValues);
    });
  }

  loadFilterOptions(): void {
    this.categoryService.getAll().subscribe((categories) => {
      this.categories = categories;
    });

    this.brandService.getAll().subscribe((brands) => {
      this.brands = brands.filter(
        (brand) =>
          brand.brandName != 'NULL' &&
          brand.brandName != '' &&
          brand.brandName != null
      );
    });
  }

  loadSubCategories(categoryId: number): void {
    this.subCategoryService
      .getSubCategoriesByCategoryId(categoryId)
      .subscribe((subCategories) => {
        this.subCategories = subCategories;
      });
  }

  loadProduct(productId: number): void {
    this.loading = true;
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.setImageUrl(product.productImage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product', error);
        this.error = 'Failed to load product details. Please try again later.';
        this.loading = false;
      },
    });
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      productName: ['', Validators.required],
      productPrice: [0, [Validators.required, Validators.min(0.01)]],
      productQuantity: [0, [Validators.required, Validators.min(1)]],
      productCategory: ['', [Validators.required, Validators.minLength(1)]],
      productSubCategory: ['', [Validators.required, Validators.minLength(1)]],
      productBrand: ['', [Validators.required, Validators.minLength(1)]],
      productDescription: [''],
      productColor: [''],
      productCondition: ['', [Validators.required, Validators.minLength(1)]],
      productWeight: [null],
      length: [null],
      width: [null],
      height: [null],
      productImage: [''],
    });
  }

  createEmptyProduct(): Product {
    return {
      productId: 0,
      productName: '',
      productPrice: 0,
      productQuantity: 0,
      productSubCategory: {
        subCategoryId: 0,
        subCategoryName: '',
        subCategoryDescription: '',
        subCategoryImage: '',
        productCategory: {
          categoryId: 0,
          categoryName: '',
          categoryImage: '',
        },
      },
      brand: {
        brandId: 0,
        brandName: '',
        brandDescription: '',
      },
      productColor: null,
      productCondition: '',
      productDescription: '',
      productWeight: null,
      productDimensions: null,
      productImage: '',
      dateAdded: new Date(),
      dateModified: new Date(),
    };
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode && this.product) {
      this.initializeForm();
    }
  }

  initializeForm(): void {
    if (this.product) {
      this.productForm.patchValue({
        productName: this.product.productName,
        productPrice: this.product.productPrice,
        productQuantity: this.product.productQuantity,
        productCategory: this.product.productSubCategory.productCategory || '',
        productSubCategory: this.product.productSubCategory || '',
        productBrand: this.product.brand || '',
        productDescription: this.product.productDescription || '',
        productWeight: this.product.productWeight,
        length: this.product.productDimensions?.split('x')[0],
        width: this.product.productDimensions?.split('x')[1],
        height: this.product.productDimensions?.split('x')[2],
        productImage: this.product.productImage || '',
        productColor: this.product.productColor || '',
        productCondition: this.product.productCondition || '',
      });
      this.productForm
        .get('category')
        ?.valueChanges.subscribe((category: ProductCategory) => {
          this.loadSubCategories(category.categoryId || 0);
          if (!category) {
            this.productForm.get('subCategory')?.setValue('');
          }
        });
    }
  }

  setImageId(imageId: string): void {
    if (imageId === null || imageId === undefined || imageId.trim() === '') {
      this.productForm.patchValue({
        productImage: '',
      });
      if (this.product) {
        this.product.productImage = '';
      }
      return;
    } else {
      this.productForm.patchValue({
        productImage: imageId,
      });
      if (this.product) {
        this.product.productImage = imageId;
      }
      return;
    }
  }

  cancelEdit(): void {
    if (this.isNewProduct) {
      this.goBack();
    } else {
      this.isEditMode = false;
      this.productForm.reset();
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid && this.productForm.pristine) {
      this.snackBar.open('Fill all required fields', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    const formValues = this.productForm.value;
    let dimensions: string = '';
    if (formValues.length || formValues.width || formValues.height) {
      dimensions =
        formValues.length + 'x' + formValues.width + 'x' + formValues.height;
    }

    const productData: ProductRequest = {
      productName: formValues.productName,
      productCategoryId: formValues.productCategory.categoryId,
      subCategoryId: formValues.productSubCategory.subCategoryId,
      productBrandId: formValues.productBrand.brandId,
      productPrice: formValues.productPrice,
      productQuantity: formValues.productQuantity,
      productDescription: formValues.productDescription,
      productCondition: formValues.productCondition,
      productWeight: formValues.productWeight,
      productDimensions: dimensions,
      productImage: formValues.productImage,
      dateModified: new Date(),
      dateAdded: this.isNewProduct
        ? new Date()
        : this.product?.dateAdded || new Date(),
      productId: this.isNewProduct ? undefined : this.product?.productId || 0,
      productColor: formValues.productColor || null,
    };

    this.loading = true;
    if (this.isNewProduct) {
      this.productService.addProduct(productData).subscribe({
        next: (response) => {
          if (typeof response !== 'string') {
            this.loading = false;
            this.product = response;
            this.isEditMode = false;
            this.isNewProduct = false;
            this.snackBar.open('Product added successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.router.navigate(['/inventory/products', response.productId]);
          } else {
            console.log('Error adding product', response);
            this.snackBar.open('Failed to add product!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              panelClass: ['error-snackbar'],
              verticalPosition: 'top',
            });
          }
        },
        error: (error) => {
          console.error('Error adding product', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to add product. Please try again.',
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
    } else if (this.product) {
      this.productService.updateProduct(this.product).subscribe({
        next: (products) => {
          this.product = products[0];
          this.isEditMode = false;
          this.loading = false;
          this.snackBar.open('Product updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          // window.location.reload();
        },
        error: (error) => {
          console.error('Error updating product', error);
          this.loading = false;
          this.snackBar.open(
            'Failed to update product. Please try again.',
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            }
          );
        },
      });
    }
  }

  confirmDelete(): void {
    if (!this.product || !this.product.productId) {
      this.snackBar.open('No product to delete!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }
    this.loading = true;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete the product "${this.product.productName}" ? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteProduct();
      }
    });
  }

  deleteProduct(): void {
    this.productService.deleteProduct(this.product?.productId || 0).subscribe({
      next: (response: HttpResponse<string>) => {
        if (response.status == 200 && response.body?.includes('successfully')) {
          this.snackBar.open('Product deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
          this.loading = false;
          this.router.navigate(['/inventory/products']);
        } else {
          console.error('Error deleting product', response);
          this.snackBar.open('Failed to delete product!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Failed to delete product', error);
        this.snackBar.open(
          'Failed to delete product. Please try again.',
          'Close',
          {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          }
        );
        this.loading = false;
      },
    });
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

  compareBrands = (b1: ProductBrand, b2: ProductBrand) =>
    b1 && b2 && b1.brandId === b2.brandId;

  compareCategories = (c1: ProductCategory, c2: ProductCategory) =>
    c1 && c2 && c1.categoryId === c2.categoryId;

  compareSubCategories = (sc1: SubCategory, sc2: SubCategory) =>
    sc1 && sc2 && sc1.subCategoryId === sc2.subCategoryId;

  goBack(): void {
    const referrer = document.referrer;
    if (
      referrer.includes('/inventory/products') &&
      !referrer.includes('/inventory/products/')
    ) {
      this.location.back();
    } else {
      this.router.navigate(['/inventory/products']);
      // this.location.back();
    }
  }

  updateProductFromForm(formValues: any): void {
    if (this.product) {
      this.product.productName = formValues.productName;
      this.product.productPrice = formValues.productPrice;
      this.product.productQuantity = formValues.productQuantity;
      this.product.productDescription = formValues.productDescription;
      this.product.productColor = formValues.productColor;
      this.product.productCondition = formValues.productCondition;
      this.product.productWeight = formValues.productWeight;
      this.product.productImage = formValues.productImage;
      this.product.dateModified = new Date();

      if (formValues.productCategory?.categoryId) {
        this.product.productSubCategory.productCategory = {
          categoryId: formValues.productCategory.categoryId,
          categoryName: formValues.productCategory.categoryName,
          categoryImage: formValues.productCategory.categoryImage,
        };
      }

      if (formValues.productSubCategory?.subCategoryId) {
        this.product.productSubCategory = {
          ...this.product.productSubCategory,
          subCategoryId: formValues.productSubCategory.subCategoryId,
          subCategoryName: formValues.productSubCategory.subCategoryName,
          subCategoryDescription:
            formValues.productSubCategory.subCategoryDescription,
          subCategoryImage: formValues.productSubCategory.subCategoryImage,
          productCategory: this.product.productSubCategory.productCategory,
        };
      }

      if (formValues.productBrand?.brandId) {
        this.product.brand = {
          brandId: formValues.productBrand.brandId,
          brandName: formValues.productBrand.brandName,
          brandDescription: formValues.productBrand.brandDescription,
        };
      }

      let dimensions: string = '';
      if (formValues.length || formValues.width || formValues.height) {
        dimensions =
          formValues.length + 'x' + formValues.width + 'x' + formValues.height;
      }
      this.product.productDimensions = dimensions;
    }
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
