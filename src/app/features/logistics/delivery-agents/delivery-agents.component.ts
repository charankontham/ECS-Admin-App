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
  DeliveryAgent,
  DeliveryAgentFilters,
} from '../../../core/models/delivery.model';
import {
  DeliveryAgentsPageState,
  NavigationStateService,
} from '../../../core/services/navigation-state.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
} from 'rxjs';
import { DeliveryAgentService } from '../../../core/services/delivery-agent.service';
import {
  AVAILABILITY_STATUS_MAP,
  AvailabilityStatus,
  compare,
} from '../../../core/util/util';

@Component({
  selector: 'app-delivery-agents',
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
  templateUrl: './delivery-agents.component.html',
  styleUrl: './delivery-agents.component.css',
})
export class DeliveryAgentsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'agentId',
    'name',
    'availabilityStatus',
    'servingArea',
    'rating',
    'totalDeliveries',
  ];
  dataSource: MatTableDataSource<DeliveryAgent>;
  filterForm: FormGroup;
  isLoading = true;
  totalAgents = 0;
  useClientSideSorting = true;
  agents: DeliveryAgent[] = [];
  cityList: string[] = [];
  filters: DeliveryAgentFilters = {
    type: 'deliveryAgent',
    currentPage: 0,
    offset: 5,
  };
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<DeliveryAgent>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private deliveryAgentService: DeliveryAgentService,
    private navigationStateService: NavigationStateService
  ) {
    this.dataSource = new MatTableDataSource<DeliveryAgent>([]);
    this.filterForm = this.fb.group({
      search: [''],
      servingArea: [''],
      availabilityStatus: [''],
      agentRating: [''],
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadCityList().subscribe({
      next: (data) => {
        this.cityList = data.list;
        this.navigationStateService
          .getDeliveryAgentsPageState()
          .subscribe((currentState) => {
            if (currentState) {
              this.restorePageState(currentState);
            } else {
              this.loadDeliveryAgents();
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
          servingArea: values.servingArea ? values.servingArea : null,
          availabilityStatus: values.availabilityStatus
            ? values.availabilityStatus
            : null,
          agentRating: values.agentRating ? values.agentRating : null,
          searchValue: values.search.trim() != '' ? values.search : null,
          currentPage: 0,
        };
        this.loadDeliveryAgents();
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

  loadCityList(): Observable<any> {
    return of({
      list: [
        'Boca Raton',
        'Pompano Beach',
        'Delray',
        'Deerfield',
        'Cypress Creek',
        'WestPalm',
        'North Palm',
      ],
    });
  }

  getAvailabilityStatusArray(): number[] {
    return Array(Object.keys(AvailabilityStatus).length / 2)
      .fill(0)
      .map((_, i) => i + 1);
  }

  getStatusValue(statusId: number): string {
    return AVAILABILITY_STATUS_MAP[statusId];
  }

  getRatingArray(): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => i + 1);
  }

  loadDeliveryAgents(): void {
    this.isLoading = true;
    this.deliveryAgentService
      .getAllDeliveryAgentsBypagination(this.filters)
      .subscribe({
        next: (response) => {
          this.agents = response.items;
          this.dataSource.data = response.items;
          this.totalAgents = response.totalCount;
          if (this.useClientSideSorting && this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading delivery agents : ', error);
          this.isLoading = false;
        },
      });
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      search: '',
      servingArea: '',
      AvailabilityStatus: '',
      agentRating: '',
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter(filterName: string): void {
    this.filterForm.get(filterName)?.setValue('');
  }

  onDeliveryAgentClick(event: MouseEvent, order: DeliveryAgent): void {
    const agents = this.router.serializeUrl(
      this.router.createUrlTree([
        '/logistics/delivery-agents',
        order.deliveryAgentId,
      ])
    );
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(agents, '_blank');
      return;
    }
    event.preventDefault();
    this.router.navigateByUrl(agents);
  }

  pageChanged(event: PageEvent): void {
    if (this.useClientSideSorting && this.agents.length >= this.totalAgents) {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      const startIndex = event.pageIndex * event.pageSize;
      const endIndex = startIndex + event.pageSize;
      this.dataSource.data = this.agents.slice(startIndex, endIndex);
    } else {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      this.loadDeliveryAgents();
    }
  }

  sortData(sort: Sort): void {
    if (this.useClientSideSorting) {
      if (sort.direction === '') {
        this.dataSource.data = [...this.agents].slice(
          this.filters.currentPage * this.filters.offset,
          (this.filters.currentPage + 1) * this.filters.offset
        );
        return;
      }
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction as 'asc' | 'desc';
      const data = [...this.agents];
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'agentId':
            return compare(a.deliveryAgentId, b.deliveryAgentId, isAsc);
          case 'name':
            return compare(a.deliveryAgentName, b.deliveryAgentName, isAsc);
          case 'servingArea':
            return compare(a.servingArea, b.servingArea, isAsc);
          case 'rating':
            return compare(a.rating, b.rating, isAsc);
          case 'availabilityStatus':
            return compare(a.availabilityStatus, b.availabilityStatus, isAsc);
          case 'totalDeliveries':
            return compare(a.totalDeliveries, b.totalDeliveries, isAsc);
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
      this.loadDeliveryAgents();
    }
  }

  saveCurrentState(): void {
    const state: DeliveryAgentsPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setDeliveryAgentsPageState(state);
  }

  private async restorePageState(
    state: DeliveryAgentsPageState
  ): Promise<void> {
    this.filters = state.filters;
    const address = this.cityList.find(
      (address) => address == state.filters.servingArea
    );
    this.filterForm.patchValue(
      {
        address: address || null,
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );
    this.loadDeliveryAgents();
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
      this.filterForm.get('search')?.value ||
      this.filterForm.get('servingArea')?.value ||
      this.filterForm.get('availabilityStatus')?.value ||
      this.filterForm.get('agentRating')?.value
    );
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
