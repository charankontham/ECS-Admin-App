import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ProductCategoryService } from '../../../core/services/product-category.service';
import {
  ProductCategory,
  ProductCategoryFiletrs,
} from '../../../core/models/product-category.model';
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
  type Observable,
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import {
  NavigationStateService,
  CategoriesPageState,
} from '../../../core/services/navigation-state.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-product-category',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css',
})
export class ProductCategoryComponent implements OnInit, AfterViewInit {
  isLoading = false;
  categories: ProductCategory[] = [];
  totalCategories = 0;
  filterForm: FormGroup;
  dataSource = new MatTableDataSource<ProductCategory>([]);
  displayedColumns: string[] = ['categoryId', 'categoryName'];
  filters: ProductCategoryFiletrs = {
    type: 'productCategory',
    currentPage: 0,
    offset: 5,
    searchValue: null,
  };
  useClientSideSorting = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ProductCategory>;

  constructor(
    private categoryService: ProductCategoryService,
    private fb: FormBuilder,
    private navigationStateService: NavigationStateService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: '',
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    console.log('ProductCategoryComponent initialized');

    // Check for saved state
    this.navigationStateService
      .getCategoriesPageState()
      .subscribe((currentState) => {
        if (currentState) {
          this.restorePageState(currentState);
        } else {
          this.loadCategories();
        }
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
          searchValue: values.search.trim() != '' ? values.search : null,
          currentPage: 0,
        };
        this.loadCategories();
        if (this.paginator) {
          this.paginator.firstPage();
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe((sort: Sort) => {
        console.log('Sort : ', sort);
        this.filters.sortField = sort.active;
        this.filters.sortDirection = sort.direction as 'asc' | 'desc';
        this.loadCategories();
      });
    }
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategoriesByPagination(this.filters).subscribe({
      next: (response: any) => {
        if (response.content.length >= response.totalElements) {
          const startIndex = this.filters.currentPage * this.filters.offset;
          const endIndex = startIndex + this.filters.offset;
          this.dataSource.data = response.content.slice(startIndex, endIndex);
          this.categories = response.content.slice(startIndex, endIndex);
        } else {
          this.categories = response.content;
          this.dataSource.data = response.content;
        }
        this.totalCategories = response.totalElements;
        if (this.sort && this.useClientSideSorting) {
          this.dataSource.sort = this.sort;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories', error);
        this.isLoading = false;
      },
    });
  }

  private compare(
    a: number | string,
    b: number | string,
    isAsc: boolean
  ): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  pageChanged(event: PageEvent): void {
    this.filters.currentPage = event.pageIndex;
    this.filters.offset = event.pageSize;
    this.loadCategories();
  }

  clearFilter(filterName: string): void {
    this.filterForm.get(filterName)?.setValue('');
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  saveCurrentState(): void {
    console.log('Saving current state before navigation');
    const state: CategoriesPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setCategoriesPageState(state);
  }

  private restorePageState(state: CategoriesPageState): void {
    console.log('Restoring State :', state);
    this.filters = state.filters;

    this.filterForm.patchValue(
      {
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );

    this.loadCategories();

    setTimeout(() => {
      if (this.paginator) {
        this.paginator.pageIndex = state.currentPage;
        this.paginator.pageSize = state.pageSize;
        this.paginator._changePageSize(state.pageSize);
      }

      if (state.scrollPosition) {
        window.scrollTo(0, state.scrollPosition);
      }
    }, 300);
  }

  onCategoryClick(event: Event, category: ProductCategory): void {
    this.saveCurrentState();
    console.log('Navigating to category details');
    this.router.navigate(['/inventory/categories', category.categoryId]);
    event.preventDefault();
  }

  navigateToSubCategories(): void {
    this.router.navigate(['/inventory/sub-categories']);
  }

  checkIsDefaultFilterForm(): boolean {
    return !this.filterForm.get('search')?.value;
  }
}
