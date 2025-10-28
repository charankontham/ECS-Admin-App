import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import {
  MatPaginatorModule,
  MatPaginator,
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderFilters } from '../../../core/models/order.model';
import {
  ProductCategory,
  SubCategory,
} from '../../../core/models/product-category.model';
import { ProductCategoryService } from '../../../core/services/product-category.service';
import { ProductSubCategoryService } from '../../../core/services/product-sub-category.service';
import { ProductBrandService } from '../../../core/services/product-brand.service';
import { ProductBrand } from '../../../core/models/product-brand.model';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  NavigationStateService,
  OrdersPageState,
} from '../../../core/services/navigation-state.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Observable,
  of,
} from 'rxjs';
import {
  compare,
  compareBrands,
  compareCategories,
} from '../../../core/util/util';

@Component({
  selector: 'app-order-items',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'orderId',
    'customer',
    'address',
    'items',
    'orderDate',
  ];
  dataSource: MatTableDataSource<Order>;
  filterForm: FormGroup;
  loading = true;
  totalOrders = 0;
  useClientSideSorting = true;
  orders: Order[] = [];
  categories: ProductCategory[] = [];
  subCategories: SubCategory[] = [];
  brands: ProductBrand[] = [];
  filters: OrderFilters = {
    type: 'order',
    currentPage: 0,
    offset: 5,
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Order>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orderService: OrderService,
    private categoryService: ProductCategoryService,
    private subCategoryService: ProductSubCategoryService,
    private brandService: ProductBrandService,
    private navigationStateService: NavigationStateService
  ) {
    this.dataSource = new MatTableDataSource<Order>([]);
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      subCategory: [''],
      brand: [''],
      orderDateFrom: [null],
      orderDateTo: [null],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.loadFilterOptions().subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.brands = data.brands;

        this.navigationStateService
          .getOrdersPageState()
          .subscribe((currentState) => {
            if (currentState) {
              this.restorePageState(currentState);
            } else {
              this.loadOrders();
            }
          });
      },
      error: (error) => {
        console.error('Error loading filter options', error);
        this.loading = false;
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
        console.log(values);
        console.log(new Date(values.orderDateFrom));
        this.filters = {
          ...this.filters,
          categoryId: values.category ? values.category.categoryId : null,
          subCategoryId: values.subCategory
            ? values.subCategory.subCategoryId
            : null,
          brandId: values.brand ? values.brand.brandId : null,
          orderDateFrom: values.orderDateFrom
            ? new Date(values.orderDateFrom)
            : null,
          orderDateTo: values.orderDateTo ? new Date(values.orderDateTo) : null,
          searchValue: values.search.trim() != '' ? values.search : null,
          currentPage: 0,
        };
        this.loadOrders();
        if (this.paginator) {
          this.paginator.firstPage();
        }
      });
    this.updateSubCategoryUponCategoryChange();
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
        .subscribe({
          next: (subCategories) => {
            this.subCategories = subCategories;
            resolve();
          },
          error: (error) => {
            console.error('Error loading sub-categories: ', error);
            resolve();
          },
        });
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrdersBypagination(this.filters).subscribe({
      next: (response) => {
        this.orders = response.content;
        this.dataSource.data = response.content;
        // this.dataSource.paginator = this.paginator;
        this.totalOrders = response.totalElements;
        if (this.useClientSideSorting && this.sort) {
          this.dataSource.sort = this.sort;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders : ', error);
        this.loading = false;
      },
    });
  }

  updateSubCategoryUponCategoryChange(): void {
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

  clearAllFilters(): void {
    this.filterForm.reset({
      search: '',
      category: '',
      subCategory: '',
      brand: '',
      orderDateFrom: null,
      orderDateTo: null,
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter(filterName: string): void {
    this.filterForm.get(filterName)?.setValue('');
  }

  onOrderClick(event: MouseEvent, order: Order): void {
    const orderUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/logistics/orders', order.orderId])
    );
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(orderUrl, '_blank');
      return;
    }
    event.preventDefault();
    console.log('Order url:' + orderUrl);
    this.router.navigateByUrl(orderUrl);
  }

  pageChanged(event: PageEvent): void {
    if (this.useClientSideSorting && this.orders.length >= this.totalOrders) {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      const startIndex = event.pageIndex * event.pageSize;
      const endIndex = startIndex + event.pageSize;
      this.dataSource.data = this.orders.slice(startIndex, endIndex);
    } else {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      this.loadOrders();
    }
  }

  sortData(sort: Sort): void {
    if (this.useClientSideSorting) {
      if (sort.direction === '') {
        this.dataSource.data = [...this.orders].slice(
          this.filters.currentPage * this.filters.offset,
          (this.filters.currentPage + 1) * this.filters.offset
        );
        return;
      }
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction as 'asc' | 'desc';
      const data = [...this.orders];
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'orderId':
            return compare(a.orderId, b.orderId, isAsc);
          case 'customer':
            return compare(
              a.customer.customerName,
              b.customer.customerName,
              isAsc
            );
          case 'address':
            return compare(
              a.shippingAddress.addressId,
              b.shippingAddress.addressId,
              isAsc
            );
          case 'orderDate':
            return compare(a.orderDate, b.orderDate, isAsc);
          // case 'category':
          //   return compare(
          //     a.productSubCategory.productCategory.categoryId || '',
          //     b.productSubCategory.productCategory.categoryId || '',
          //     isAsc
          //   );
          // case 'subCategory':
          //   return compare(
          //     a.productSubCategory.subCategoryId || '',
          //     b.productSubCategory.subCategoryId || '',
          //     isAsc
          //   );
          // case 'brand':
          //   return compare(a.brand.brandId || '', b.brand.brandId || '', isAsc);
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
      this.loadOrders();
    }
  }

  private async restorePageState(state: OrdersPageState): Promise<void> {
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

    // if (categoryToRestore) {
    //   this.loadSubCategories(categoryToRestore.categoryId || 0);
    // }

    const subCategoryToRestore = this.subCategories.find(
      (sc) => sc.subCategoryId == state.filters.subCategoryId
    );

    this.filterForm.patchValue(
      {
        category: categoryToRestore || null,
        subCategory: subCategoryToRestore || null,
        brand: brandToRestore || null,
        orderDateFrom: state.filters.orderDateFrom || null,
        orderDateTo: state.filters.orderDateTo || null,
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );
    this.loadOrders();
    setTimeout(() => {
      this.paginator.pageIndex = state.currentPage;
      this.paginator.pageSize = state.pageSize;
      this.paginator._changePageSize(state.pageSize);
      if (state.scrollPosition) {
        window.scrollTo(0, state.scrollPosition);
      }
    }, 300);
  }

  saveCurrentState(): void {
    const state: OrdersPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setOrdersPageState(state);
  }

  checkIsDefaultFilterForm(): boolean {
    return !(
      this.filterForm.get('category')?.value ||
      this.filterForm.get('subCategory')?.value ||
      this.filterForm.get('brand')?.value ||
      this.filterForm.get('orderDateFrom')?.value ||
      this.filterForm.get('orderDateTo')?.value ||
      this.filterForm.get('search')?.value
    );
  }

  formatDate(date: string | Date): string {
    if (date.toString().indexOf('T') < 0) {
      date =
        date.toString().indexOf('Z') > 0
          ? date.toString().replace(' ', 'T')
          : date.toString().replace(' ', 'T') + 'Z';
    }
    const newDate = new Date(date);
    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  compareBrands = compareBrands;
  compareCategories = compareCategories;
  compareSubCategories = compareCategories;
}
