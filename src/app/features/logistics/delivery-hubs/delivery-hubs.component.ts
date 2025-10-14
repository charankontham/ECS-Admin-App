import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import {
  DeliveryHub,
  DeliveryHubFilters,
} from '../../../core/models/delivery.model';
import { DeliveryHubService } from '../../../core/services/delivery-hub.service';
import {
  DeliveryHubsPageState,
  NavigationStateService,
} from '../../../core/services/navigation-state.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  Observable,
  of,
} from 'rxjs';
import { compare } from '../../../core/util/util';

@Component({
  selector: 'app-delivery-hubs',
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
  ],
  templateUrl: './delivery-hubs.component.html',
  styleUrl: './delivery-hubs.component.css',
})
export class DeliveryHubsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['hubId', 'name', 'city', 'state', 'dateAdded'];
  dataSource: MatTableDataSource<DeliveryHub>;
  filterForm: FormGroup;
  isLoading = true;
  totalHubs = 0;
  useClientSideSorting = true;
  hubs: DeliveryHub[] = [];
  addressList: string[] = [];
  filters: DeliveryHubFilters = {
    type: 'deliveryHub',
    currentPage: 0,
    offset: 5,
  };
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DeliveryHub>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private deliveryHubService: DeliveryHubService,
    private navigationStateService: NavigationStateService
  ) {
    this.dataSource = new MatTableDataSource<DeliveryHub>([]);
    this.filterForm = this.fb.group({
      search: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadAddressList().subscribe({
      next: (data) => {
        this.addressList = data.list;
        this.navigationStateService
          .getDeliveryHubsPageState()
          .subscribe((currentState) => {
            if (currentState) {
              this.restorePageState(currentState);
            } else {
              this.loadDeliveryHubs();
            }
          });
      },
      error: (error) => {
        console.error('Error fetching address list', error);
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
          address: values.address ? values.address : null,
          searchValue: values.search.trim() != '' ? values.search : null,
          currentPage: 0,
        };
        this.loadDeliveryHubs();
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

  loadDeliveryHubs(): void {
    this.isLoading = true;
    this.deliveryHubService
      .getAllDeliveryHubsBypagination(this.filters)
      .subscribe({
        next: (response) => {
          this.hubs = response.items;
          this.dataSource.data = response.items;
          this.totalHubs = response.totalCount;
          if (this.useClientSideSorting && this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading delivery hubs : ', error);
          this.isLoading = false;
        },
      });
  }

  loadAddressList(): Observable<any> {
    return of({
      list: ['FL', 'AZ', 'NJ', 'NY', 'CA', 'GA', 'TX'],
    });
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      search: '',
      address: '',
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter(filterName: string): void {
    this.filterForm.get(filterName)?.setValue('');
  }

  onDeliveryHubClick(event: MouseEvent, order: DeliveryHub): void {
    const orderUrl = this.router.serializeUrl(
      this.router.createUrlTree([
        '/logistics/delivery-hubs',
        order.deliveryHubId,
      ])
    );
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(orderUrl, '_blank');
      return;
    }
    event.preventDefault();
    this.router.navigateByUrl(orderUrl);
  }

  pageChanged(event: PageEvent): void {
    if (this.useClientSideSorting && this.hubs.length >= this.totalHubs) {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      const startIndex = event.pageIndex * event.pageSize;
      const endIndex = startIndex + event.pageSize;
      this.dataSource.data = this.hubs.slice(startIndex, endIndex);
    } else {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      this.loadDeliveryHubs();
    }
  }

  sortData(sort: Sort): void {
    if (this.useClientSideSorting) {
      if (sort.direction === '') {
        this.dataSource.data = [...this.hubs].slice(
          this.filters.currentPage * this.filters.offset,
          (this.filters.currentPage + 1) * this.filters.offset
        );
        return;
      }
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction as 'asc' | 'desc';
      const data = [...this.hubs];
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'hubId':
            return compare(a.deliveryHubId, b.deliveryHubId, isAsc);
          case 'name':
            return compare(a.deliveryHubName, b.deliveryHubName, isAsc);
          case 'city':
            return compare(
              a.deliveryHubAddress?.city ?? '',
              b.deliveryHubAddress?.city ?? '',
              isAsc
            );
          case 'state':
            return compare(
              a.deliveryHubAddress?.state ?? '',
              b.deliveryHubAddress?.state ?? '',
              isAsc
            );
          case 'dateAdded':
            return compare(a.dateAdded, b.dateAdded, isAsc);
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
      this.loadDeliveryHubs();
    }
  }

  saveCurrentState(): void {
    const state: DeliveryHubsPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setDeliveryHubsPageState(state);
  }

  private async restorePageState(state: DeliveryHubsPageState): Promise<void> {
    this.filters = state.filters;
    const address = this.addressList.find(
      (address) => address == state.filters.address
    );

    this.filterForm.patchValue(
      {
        address: address || null,
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );
    this.loadDeliveryHubs();
    setTimeout(() => {
      this.paginator.pageIndex = state.currentPage;
      this.paginator.pageSize = state.pageSize;
      this.paginator._changePageSize(state.pageSize);
      if (state.scrollPosition) {
        window.scrollTo(0, state.scrollPosition);
      }
    }, 300);
  }

  checkIsDefaultFilterForm(): boolean {
    return !(
      this.filterForm.get('address')?.value ||
      this.filterForm.get('search')?.value
    );
  }
}
