import { Component, ElementRef, ViewChild, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { finalize } from 'rxjs/operators';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ProductSubCategoryService } from '../../../../core/services/product-subcategory.service';
import {
  ProductCategory,
  SubCategory,
} from '../../../../core/models/product-category.model';
import { ProductCategoryService } from '../../../../core/services/product-category.service';
import { ProductBrandService } from '../../../../core/services/product-brand.service';
import { ProductBrand } from '../../../../core/models/product-brand.model';
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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFile: File | null = null;

  categories: ProductCategory[] = [];
  subCategories: SubCategory[] = [];
  brands: ProductBrand[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private imageService: ImageService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private categoryService: ProductCategoryService,
    private brandService: ProductBrandService,
    private subCategoryService: ProductSubCategoryService
  ) {
    // Initialize the form with empty values
    this.productForm = this.createProductForm();
    this.initializeForm();
  }
  ngOnInit(): void {
    this.loadFilterOptions();

    // Get product ID from route params
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('productId');
      console.log('Product ID:', productId);
      this.loading = true;
      if (productId == 'new') {
        console.log('Creating new product');
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
  }

  loadFilterOptions(): void {
    this.categoryService.getAll().subscribe((categories) => {
      this.categories = categories;
    });

    this.brandService.getAll().subscribe((brands) => {
      this.brands = brands;
    });
  }

  loadSubCategories(categoryId: number): void {
    this.subCategoryService
      .getSubCategoriesByCategoryId('getByCategoryId', categoryId)
      .subscribe((subCategories) => {
        this.subCategories = subCategories;
      });
  }

  loadProduct(productId: number): void {
    this.loading = true;
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        this.product = product;
        if (product.productSubCategory.productCategory) {
          this.loadSubCategories(product.productSubCategory.subCategoryId);
        }
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
      productQuantity: [0, [Validators.required, Validators.min(0)]],
      productCategory: [''],
      productSubCategory: [''],
      productBrand: [''],
      productDescription: [''],
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
      productColor: '',
      productCondition: '',
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
        productWeight: this.product.productWeight || null,
        length: this.product.productDimensions || null,
        width: this.product.productDimensions || null,
        height: this.product.productDimensions || null,
        productImage: this.product.productImage || '',
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

  cancelEdit(): void {
    if (this.isNewProduct) {
      this.router.navigate(['/inventory/products']);
    } else {
      this.isEditMode = false;
      this.productForm.reset();
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formValues = this.productForm.value;

    // Prepare dimensions object if any dimension is provided
    let dimensions: string | null = null;
    if (formValues.length || formValues.width || formValues.height) {
      dimensions =
        formValues.length + 'x' + formValues.width + 'x' + formValues.height;
    }

    // Create updated product object
    const productData: Product = {
      ...this.product!,
      productName: formValues.name,
      // sku: formValues.sku,
      productPrice: formValues.price,
      productQuantity: formValues.quantity,
      productSubCategory: formValues.subCategory,
      brand: formValues.brand,
      productDescription: formValues.description,
      // barcode: formValues.barcode,
      productWeight: formValues.weight,
      productDimensions: dimensions,
      productImage: formValues.imageUrl,
      dateAdded: formValues.dateAdded,
      dateModified: new Date(),
    };

    this.loading = true;

    if (this.isNewProduct) {
      this.productService.addProduct(productData).subscribe({
        next: (response) => {
          if (typeof response !== 'string') {
            this.product = response;
            this.isEditMode = false;
            this.loading = false;
            this.snackBar.open('Product added successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          } else {
            console.log('Error adding product', response);
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
    } else {
      this.productService.updateProduct(productData).subscribe({
        next: (products) => {
          this.product = products[0];
          this.isEditMode = false;
          this.loading = false;
          this.snackBar.open('Product updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      var imageDoc!: ImageDoc;
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1]; // Remove "data:image/png;base64,"
        imageDoc = {
          id: '',
          imageName: this.selectedFile?.name || '',
          contentType: this.selectedFile?.type || '',
          uploadedDate: new Date(),
          size: this.selectedFile?.size || 0,
          dimensions: '', // You can calculate dimensions if needed
          comments: '',
          image: base64Data,
        };
      };
      this.uploadImage(imageDoc);
    }
  }

  uploadImage(imageDoc: ImageDoc): void {
    if (!imageDoc) {
      return;
    }

    this.imageUploading = true;

    this.imageService
      .addImage(imageDoc)
      .pipe(
        finalize(() => {
          this.imageUploading = false;
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
        })
      )
      .subscribe({
        next: (response: ImageDoc) => {
          if (response) {
            this.productForm.patchValue({
              imageId: response.id,
            });
            this.snackBar.open('Image uploaded successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          } else {
            this.snackBar.open(response || 'Failed to upload image', 'Close', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
              panelClass: ['error-snackbar'],
            });
          }
        },
        error: (error) => {
          console.error('Error uploading image', error);
          this.snackBar.open(
            'Failed to upload image. Please try again.',
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

  removeImage(): void {
    this.productForm.patchValue({
      imageId: '',
    });
  }

  getProductImageUrl(): string {
    // var imageDoc: ImageDoc;
    if (this.isEditMode) {
      const imageId = this.productForm.get('imageId')?.value;
      if (imageId) {
        this.imageService.getImageById(imageId).subscribe((imageDoc) => {
          console.log('Image url 1 : ', this.mapToImageURL(imageDoc));
          return this.mapToImageURL(imageDoc);
        });
      }
    }
    // In view mode, use the product's imageId
    else if (this.product?.productImage) {
      this.imageService
        .getImageById(this.product.productImage)
        .subscribe((imageDoc) => {
          console.log('Image url 2 : ', this.mapToImageURL(imageDoc));
          return this.mapToImageURL(imageDoc);
        });
    }
    return '/assets/images/product-placeholder.png';
  }

  mapToImageURL(imageDoc: ImageDoc): string {
    return `data:${imageDoc.contentType};base64,${imageDoc.image}`;
  }
}
