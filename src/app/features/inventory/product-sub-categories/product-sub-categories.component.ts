import {
  type AfterViewInit,
  Component,
  type OnInit,
  ViewChild,
} from '@angular/core';
import { ProductSubCategoryService } from '../../../core/services/product-sub-category.service';
import { ProductCategoryService } from '../../../core/services/product-category.service';
import {
  SubCategory,
  ProductCategory,
  SubCategoryFilters,
} from '../../../core/models/product-category.model';
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
import { Router, RouterModule } from '@angular/router';
import {
  NavigationStateService,
  SubCategoriesPageState,
} from '../../../core/services/navigation-state.service';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
  templateUrl: './product-sub-categories.component.html',
  styleUrl: './product-sub-categories.component.css',
})
export class ProductSubCategoriesComponent implements OnInit, AfterViewInit {
  isLoading = false;
  subCategories: SubCategory[] = [];
  categories: ProductCategory[] = [];
  totalSubCategories = 0;
  filterForm: FormGroup;
  dataSource = new MatTableDataSource<SubCategory>([]);
  displayedColumns: string[] = [
    'subCategoryId',
    'subCategoryName',
    'categoryName',
  ];
  filters: SubCategoryFilters = {
    type: 'subCategory',
    currentPage: 0,
    offset: 5,
  };
  useClientSideSorting = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<SubCategory>;

  constructor(
    private subCategoryService: ProductSubCategoryService,
    private categoryService: ProductCategoryService,
    private fb: FormBuilder,
    private navigationStateService: NavigationStateService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      category: null,
      search: '',
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadCategories();
    this.navigationStateService
      .getSubCategoriesPageState()
      .subscribe((currentState) => {
        if (currentState) {
          this.restorePageState(currentState);
        } else {
          this.loadSubCategories();
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
          categoryId: values.category ? values.category.categoryId : null,
          searchValue: values.search.trim() != '' ? values.search : null,
          currentPage: 0,
        };
        this.loadSubCategories();
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
        this.loadSubCategories();
      });
    }
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

  loadSubCategories(): void {
    this.isLoading = true;
    this.subCategoryService
      .getAllSubCategoriesByPagination(this.filters)
      .subscribe({
        next: (response) => {
          this.totalSubCategories = response.totalElements;
          if (response.content.length >= response.totalElements) {
            const startIndex = this.filters.currentPage * this.filters.offset;
            const endIndex = startIndex + this.filters.offset;
            this.subCategories = response.content.slice(startIndex, endIndex);
            this.dataSource.data = response.content.slice(startIndex, endIndex);
          } else {
            this.subCategories = response.content;
            this.dataSource.data = response.content;
          }
          if (this.sort && this.useClientSideSorting) {
            this.dataSource.sort = this.sort;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading subcategories', error);
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
    this.loadSubCategories();
  }

  clearFilter(filterName: string): void {
    this.filterForm
      .get(filterName)
      ?.setValue(filterName === 'category' ? null : '');
  }

  resetFilters(): void {
    this.filterForm.reset({
      category: null,
      search: '',
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  saveCurrentState(): void {
    console.log('Saving current state before navigation');
    const state: SubCategoriesPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setSubCategoriesPageState(state);
  }

  private restorePageState(state: SubCategoriesPageState): void {
    console.log('Restoring State :', state);
    this.filters = state.filters;

    const categoryToRestore = this.categories.find(
      (c) => c.categoryId == state.filters.categoryId
    );

    this.filterForm.patchValue(
      {
        category: categoryToRestore || null,
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );

    this.loadSubCategories();

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

  onSubCategoryClick(event: Event, subCategory: SubCategory): void {
    this.saveCurrentState();
    this.router.navigate([
      '/inventory/sub-categories',
      subCategory.subCategoryId,
    ]);
    event.preventDefault();
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
  }

  compareCategories = (c1: ProductCategory, c2: ProductCategory) =>
    c1 && c2 && c1.categoryId === c2.categoryId;

  checkIsDefaultFilterForm(): boolean {
    return (
      !this.filterForm.get('search')?.value &&
      !this.filterForm.get('category')?.value
    );
  }
}
