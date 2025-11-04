import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ProductBrandService } from '../../../core/services/product-brand.service';
import {
  ProductBrand,
  ProductBrandFilters,
} from '../../../core/models/product-brand.model';
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
  PageEvent,
} from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { NavigationStateService } from '../../../core/services/navigation-state.service';

interface BrandsPageState {
  filters: ProductBrandFilters;
  currentPage: number;
  pageSize: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  scrollPosition?: number;
}

@Component({
  selector: 'app-product-brand',
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
  templateUrl: './product-brand.component.html',
  styleUrl: './product-brand.component.css',
})
export class ProductBrandComponent implements OnInit, AfterViewInit {
  isLoading = false;
  brands: ProductBrand[] = [];
  totalBrands = 0;
  filterForm: FormGroup;
  dataSource = new MatTableDataSource<ProductBrand>([]);
  displayedColumns: string[] = ['brandId', 'brandName', 'brandDescription'];
  filters: ProductBrandFilters = {
    type: 'productBrand',
    currentPage: 0,
    offset: 10,
  };
  useClientSideSorting = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ProductBrand>;

  constructor(
    private brandService: ProductBrandService,
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
    this.navigationStateService
      .getBrandsPageState()
      .subscribe((currentState) => {
        if (currentState) {
          this.restorePageState(currentState);
        } else {
          this.loadBrands();
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
        this.loadBrands();
        if (this.paginator) {
          this.paginator.firstPage();
        }
      });
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
          this.loadBrands();
        });
      }
    }
  }

  loadBrands(): void {
    this.isLoading = true;
    this.brandService.getAllBrandsByPagination(this.filters).subscribe({
      next: (response) => {
        if (this.filters.sortField && this.filters.sortDirection) {
          response.content.sort((a: ProductBrand, b: ProductBrand) => {
            const isAsc = this.filters.sortDirection === 'asc';
            switch (this.filters.sortField) {
              case 'brandId':
                return this.compare(a.brandId || 0, b.brandId || 0, isAsc);
              case 'brandName':
                return this.compare(a.brandName, b.brandName, isAsc);
              case 'brandDescription':
                return this.compare(
                  a.brandDescription,
                  b.brandDescription,
                  isAsc
                );
              default:
                return 0;
            }
          });
        }
        this.totalBrands = response.totalElements;
        if (response.content.length >= response.totalElements) {
          const startIndex = this.filters.currentPage * this.filters.offset;
          const endIndex = startIndex + this.filters.offset;
          this.brands = response.content.slice(startIndex, endIndex);
          this.dataSource.data = response.content.slice(startIndex, endIndex);
        } else {
          this.brands = response.content;
          this.dataSource.data = response.content;
        }
        if (this.useClientSideSorting && this.sort) {
          this.dataSource.sort = this.sort;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading brands', error);
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
    this.loadBrands();
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
    const state: BrandsPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setBrandsPageState(state);
  }

  private restorePageState(state: BrandsPageState): void {
    this.filters = state.filters;
    this.filterForm.patchValue(
      {
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );

    this.loadBrands();

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

  onBrandClick(event: MouseEvent, brand: ProductBrand): void {
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      return;
    }
    this.saveCurrentState();
    this.router.navigate(['/inventory/brands', brand.brandId]);
    event.preventDefault();
  }

  checkIsDefaultFilterForm(): boolean {
    return !this.filterForm.get('search')?.value;
  }

  getBrandUrl(brand: ProductBrand): string {
    return this.router.serializeUrl(
      this.router.createUrlTree(['/inventory/brands', brand.brandId])
    );
  }
}
