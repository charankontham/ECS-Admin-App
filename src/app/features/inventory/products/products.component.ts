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
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Observable,
  of,
} from 'rxjs';
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
} from '../../../core/models/product-category.model';
import { ProductBrand } from '../../../core/models/product-brand.model';
import { ProductSubCategoryService } from '../../../core/services/product-sub-category.service';
import { Router, RouterModule } from '@angular/router';
import {
  NavigationStateService,
  ProductsPageState,
} from '../../../core/services/navigation-state.service';
import {
  compare,
  compareBrands,
  compareCategories,
  compareSubCategories,
} from '../../../core/util/util';

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
  displayedColumns: string[] = ['id', 'name', 'quantity', 'price'];
  baseColumns: string[] = ['id', 'name', 'quantity', 'price'];
  filters: ProductFilters = {
    type: 'product',
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
    private fb: FormBuilder,
    private navigationStateService: NavigationStateService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      category: null,
      subCategory: null,
      brand: null,
      search: '',
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadFilterOptions().subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.brands = data.brands;

        this.navigationStateService
          .getProductsPageState()
          .subscribe((currentState) => {
            if (currentState) {
              this.restorePageState(currentState);
            } else {
              this.loadProducts();
            }
          });
      },
      error: (error) => {
        console.error('Error loading filter options', error);
        this.isLoading = false;
      },
    });
    this.filterForm.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        catchError(() => of({}))
      )
      .subscribe((values) => {
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
        this.updateDisplayedColumns();
        this.loadProducts();
        if (this.paginator) {
          this.paginator.firstPage();
        }
      });

    this.filterForm.get('category')?.valueChanges.subscribe((category) => {
      if (
        !category ||
        category == '' ||
        category == 'null' ||
        category == null
      ) {
        this.filterForm.get('subCategory')?.setValue('');
        this.subCategories = [];
      } else {
        this.loadSubCategories(category.categoryId).then(() => {
          this.filterForm.get('subCategory')?.setValue('');
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      if (this.useClientSideSorting) {
        this.dataSource.sort = this.sort;
      } else {
        this.sort.sortChange.subscribe((sort: Sort) => {
          this.filters.sortField = sort.active;
          this.filters.sortDirection = sort.direction as 'asc' | 'desc';
        });
      }
    }

    this.paginator._intl.getRangeLabel = (
      page: number,
      pageSize: number,
      length: number
    ) => {
      if (length === 0 || pageSize === 0) {
        return `Page 1 (0 of ${length})`;
      }

      const startIndex = page * pageSize;
      const endIndex =
        startIndex < length
          ? Math.min(startIndex + pageSize, length)
          : startIndex + pageSize;
      const currentPage = page + 1;

      return `Page ${currentPage} (${
        startIndex + 1
      } - ${endIndex} of ${length})`;
    };
  }

  loadFilterOptions(): Observable<any> {
    return forkJoin({
      categories: this.categoryService.getAll(),
      brands: this.brandService.getAll(),
    });
  }

  loadSubCategories(categoryId: number): Promise<void> {
    return new Promise((resolve) => {
      this.subCategoryService
        .getSubCategoriesByCategoryId(categoryId)
        .subscribe((subCategories) => {
          this.subCategories = subCategories;
          resolve();
        });
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
        console.error('Error loading products : ', error);
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
            return compare(a.productId, b.productId, isAsc);
          case 'name':
            return compare(a.productName, b.productName, isAsc);
          case 'quantity':
            return compare(a.productQuantity, b.productQuantity, isAsc);
          case 'price':
            return compare(a.productPrice, b.productPrice, isAsc);
          case 'category':
            return compare(
              a.productSubCategory.productCategory.categoryId || '',
              b.productSubCategory.productCategory.categoryId || '',
              isAsc
            );
          case 'subCategory':
            return compare(
              a.productSubCategory.subCategoryId || '',
              b.productSubCategory.subCategoryId || '',
              isAsc
            );
          case 'brand':
            return compare(a.brand.brandId || '', b.brand.brandId || '', isAsc);
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

  saveCurrentState(): void {
    const state: ProductsPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setProductsPageState(state);
  }

  private async restorePageState(state: ProductsPageState): Promise<void> {
    this.filters = state.filters;
    const categoryToRestore = this.categories.find(
      (c) => c.categoryId == state.filters.categoryId
    );

    if (categoryToRestore) {
      await this.loadSubCategories(categoryToRestore.categoryId || 0);
    }

    const brandToRestore = this.brands.find(
      (b) => b.brandId == state.filters.brandId
    );

    if (categoryToRestore) {
      this.loadSubCategories(categoryToRestore.categoryId || 0);
    }

    const subCategoryToRestore = this.subCategories.find(
      (sc) => sc.subCategoryId == state.filters.subCategoryId
    );

    this.filterForm.patchValue(
      {
        category: categoryToRestore || null,
        subCategory: subCategoryToRestore || null,
        brand: brandToRestore || null,
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );
    this.updateDisplayedColumns();
    this.loadProducts();
    setTimeout(() => {
      this.paginator.pageIndex = state.currentPage;
      this.paginator.pageSize = state.pageSize;
      this.paginator._changePageSize(state.pageSize);
      if (state.scrollPosition) {
        window.scrollTo(0, state.scrollPosition);
      }
    }, 300);
  }

  onProductClick(event: MouseEvent, product: Product): void {
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      return;
    }
    this.saveCurrentState();
    this.router.navigate(['/inventory/products', product.productId]);
    event.preventDefault();
  }

  getProductUrl(product: Product): string {
    return this.router.serializeUrl(
      this.router.createUrlTree(['/inventory/products', product.productId])
    );
  }

  checkIsDefaultFilterForm(): boolean {
    return !(
      this.filterForm.get('category')?.value ||
      this.filterForm.get('subCategory')?.value ||
      this.filterForm.get('brand')?.value ||
      this.filterForm.get('search')?.value
    );
  }

  compareBrands = compareBrands;
  compareCategories = compareCategories;
  compareSubCategories = compareSubCategories;
}
