import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductFilters } from '../../../core/models/product.model';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';
import {
  MatTableModule,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  type PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort, type Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductCategoryService } from '../../../core/services/product-category.service';
import { ProductBrandService } from '../../../core/services/product-brand.service';
import {
  ProductCategory,
  SubCategory,
  SubCategoryEnriched,
} from '../../../core/models/product-category.model';
import { ProductBrand } from '../../../core/models/product-brand.model';
import { ProductSubCategoryService } from '../../../core/services/product-subcategory.service';
import { RouterModule } from '@angular/router';
import { ImageUploaderComponent } from '../../images/image-uploader/image-uploader.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor,
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    // ImageUploaderComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  providers: [ProductService, FormBuilder],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  isLoading: boolean = false;
  products: Product[] = [];
  categories: ProductCategory[] = [];
  subCategories: SubCategory[] = [];
  brands: ProductBrand[] = [];
  totalProducts = 0;
  filterForm: FormGroup;
  useClientSideSorting = true;
  dataSource = new MatTableDataSource<Product>([]);
  allLoadedProducts: Product[] = [];
  displayedColumns: string[] = ['id', 'name', 'quantity', 'price', 'actions'];
  baseColumns: string[] = ['id', 'name', 'quantity', 'price', 'actions'];
  filters: ProductFilters = {
    currentPage: 0,
    offset: 5,
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Product>;

  constructor(
    private productService: ProductService,
    private categoryService: ProductCategoryService,
    private subCategoryService: ProductSubCategoryService,
    private brandService: ProductBrandService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      category: null,
      subCategory: null,
      brand: null,
      search: '',
    });
  }

  fetchProducts() {
    // this.isLoading = true;
    // const apiUrl = `https://your-backend-api.com/products?page=${this.currentPage}&size=${this.itemsPerPage}`;
    // this.productService
    //   .getAllProductsBypagination(this.currentPage, this.itemsPerPage)
    //   .pipe(
    //     catchError((error) => {
    //       console.error('Error fetching products', error);
    //       this.isLoading = false;
    //       return of([]);
    //     })
    //   )
    //   .subscribe((response) => {
    //     console.log('Resp = ', response);
    //     this.products = response.content;
    //     this.totalPages = response.totalPages;
    //     this.totalPages = response.totalPages;
    //     this.isLoading = false;
    //   });
  }

  ngOnInit(): void {
    this.loadFilterOptions();
    this.filterForm.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        catchError(() => of({}))
      )
      .subscribe((values) => {
        console.log('Values : ', values);
        this.filters = {
          ...this.filters,
          categoryId: values.category ? values.category.categoryId : null,
          subCategoryId: values.subCategory
            ? values.subCategory.subCategoryId
            : null,
          brandId: values.brand ? values.brand.brandId : null,
          searchValue: values.search.trim() != '' ? values.search : null,
          currentPage: 0,
        };
        console.log('Filters : ', this.filters);
        this.updateDisplayedColumns();
        this.loadProducts();
        if (this.paginator) {
          this.paginator.firstPage();
        }
      });

    this.filterForm.get('category')?.valueChanges.subscribe((category) => {
      if (!category || category == '' || category == 'null') {
        this.filterForm.get('subCategory')?.setValue('');
      } else {
        this.loadSubCategories(category.categoryId);
      }
    });
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      if (this.useClientSideSorting) {
        this.dataSource.sort = this.sort;
      } else {
        this.sort.sortChange.subscribe((sort: Sort) => {
          console.log('Sort : ', sort);
          this.filters.sortField = sort.active;
          this.filters.sortDirection = sort.direction as 'asc' | 'desc';
        });
      }
    }
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

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProductsBypagination(this.filters).subscribe({
      next: (response) => {
        this.allLoadedProducts = response.content;
        this.dataSource.data = response.content;
        this.totalProducts = response.totalElements;
        if (this.useClientSideSorting && this.sort) {
          this.dataSource.sort = this.sort;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.isLoading = false;
      },
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  pageChanged(event: PageEvent): void {
    if (
      this.useClientSideSorting &&
      this.allLoadedProducts.length >= this.totalProducts
    ) {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      const startIndex = event.pageIndex * event.pageSize;
      const endIndex = startIndex + event.pageSize;
      this.dataSource.data = this.allLoadedProducts.slice(startIndex, endIndex);
    } else {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      this.loadProducts();
    }
  }

  sortData(sort: Sort): void {
    if (this.useClientSideSorting) {
      if (sort.direction === '') {
        this.dataSource.data = [...this.allLoadedProducts].slice(
          this.filters.currentPage * this.filters.offset,
          (this.filters.currentPage + 1) * this.filters.offset
        );
        return;
      }
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction as 'asc' | 'desc';
      const data = [...this.allLoadedProducts];
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'id':
            return this.compare(a.productId, b.productId, isAsc);
          case 'name':
            return this.compare(a.productName, b.productName, isAsc);
          case 'quantity':
            return this.compare(a.productQuantity, b.productQuantity, isAsc);
          case 'price':
            return this.compare(a.productPrice, b.productPrice, isAsc);
          case 'category':
            return this.compare(
              a.productSubCategory.productCategory.categoryId || '',
              b.productSubCategory.productCategory.categoryId || '',
              isAsc
            );
          case 'subCategory':
            return this.compare(
              a.productSubCategory.subCategoryId || '',
              b.productSubCategory.subCategoryId || '',
              isAsc
            );
          case 'brand':
            return this.compare(
              a.brand.brandId || '',
              b.brand.brandId || '',
              isAsc
            );
          default:
            return 0;
        }
      });
      const startIndex = this.filters.currentPage * this.filters.offset;
      const endIndex = startIndex + this.filters.offset;
      this.dataSource.data = data.slice(startIndex, endIndex);
    } else {
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction as 'asc' | 'desc';
      this.loadProducts();
    }
  }

  private compare(
    a: number | string,
    b: number | string,
    isAsc: boolean
  ): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  updateDisplayedColumns(): void {
    const columns = [...this.baseColumns];
    if (!this.filterForm.get('category')?.value) {
      columns.push('category');
    }

    if (!this.filterForm.get('subCategory')?.value) {
      columns.push('subCategory');
    }

    if (!this.filterForm.get('brand')?.value) {
      columns.push('brand');
    }

    this.displayedColumns = columns;
  }

  showColumn(column: string): boolean {
    return this.displayedColumns.includes(column);
  }

  clearFilter(filterName: string): void {
    this.filterForm.get(filterName)?.setValue('');
  }

  resetFilters(): void {
    this.filterForm.reset({
      category: '',
      subCategory: '',
      brand: '',
      search: '',
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete ${product.productName}?`)) {
      console.log('Deleting product:', product);
    }
  }
}
