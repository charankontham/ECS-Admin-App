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
import { DeliveryAgentService } from '../../../core/services/delivery-agent.service';
import { DeliveryHubService } from '../../../core/services/delivery-hub.service';
import {
  OrderReturnsPageState,
  NavigationStateService,
} from '../../../core/services/navigation-state.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  forkJoin,
} from 'rxjs';
import {
  DeliveryAgent,
  DeliveryHub,
} from '../../../core/models/delivery.model';
import {
  OrderReturn,
  OrderReturnFilters,
} from '../../../core/models/order.model';
import { OrderReturnsService } from '../../../core/services/order-return.service';
import {
  compare,
  ORDER_RETURN_STATUS_MAP,
  ORDER_TRACKING_STATUS_MAP,
  OrderStatusClassMap,
} from '../../../core/util/util';

@Component({
  selector: 'app-return-orders',
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
  templateUrl: './return-orders.component.html',
  styleUrl: './return-orders.component.css',
})
export class ReturnOrdersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'returnOrderId',
    'customerId',
    'productName',
    'status',
    'returnedDate',
  ];
  dataSource: MatTableDataSource<OrderReturn>;
  filterForm: FormGroup;
  isLoading = true;
  totalReturnOrders = 0;
  useClientSideSorting = true;
  returnOrders: OrderReturn[] = [];
  deliveryAgents: DeliveryAgent[] = [];
  deliveryHubs: DeliveryHub[] = [];
  statusList: { value: number; label: string }[] = [];

  filters: OrderReturnFilters = {
    type: 'orderReturn',
    currentPage: 0,
    offset: 5,
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<OrderReturn>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private returnOrderService: OrderReturnsService,
    private deliveryAgentService: DeliveryAgentService,
    private deliveryHubService: DeliveryHubService,
    private navigationStateService: NavigationStateService
  ) {
    this.dataSource = new MatTableDataSource<OrderReturn>([]);
    this.filterForm = this.fb.group({
      search: [''],
      status: [null],
      deliveryAgent: [null],
      deliveryHub: [null],
    });

    this.statusList = Object.entries(ORDER_RETURN_STATUS_MAP).map(
      ([key, value]) => ({
        value: Number(key),
        label: value,
      })
    );
  }

  ngOnInit(): void {
    this.isLoading = true;

    forkJoin({
      agents: this.deliveryAgentService.getAllDeliveryAgents(),
      hubs: this.deliveryHubService.getAllDeliveryHubs(),
    }).subscribe({
      next: (data) => {
        this.deliveryAgents = data.agents;
        this.deliveryHubs = data.hubs;

        this.navigationStateService
          .getOrderReturnsPageState()
          .subscribe((currentState) => {
            if (currentState) {
              this.restorePageState(currentState);
            } else {
              this.loadReturnOrders();
            }
          });
      },
      error: (error) => {
        console.error('Error fetching filter data', error);
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
          orderStatusId: values.status || null,
          deliveryAgentId: values.deliveryAgent || null,
          deliveryHubId: values.deliveryHub || null,
          searchValue: values.search.trim() !== '' ? values.search : null,
          currentPage: 0,
        };
        this.loadReturnOrders();
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

  loadReturnOrders(): void {
    this.isLoading = true;
    this.returnOrderService
      .getAllOrderReturnsBypagination(this.filters)
      .subscribe({
        next: (response) => {
          this.returnOrders = response.items;
          this.dataSource.data = response.items;
          this.totalReturnOrders = response.totalCount;
          if (this.useClientSideSorting && this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading return orders: ', error);
          this.isLoading = false;
        },
      });
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      search: '',
      status: null,
      deliveryAgent: null,
      deliveryHub: null,
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter(filterName: string): void {
    this.filterForm
      .get(filterName)
      ?.setValue(filterName === 'search' ? '' : null);
  }

  onReturnOrderClick(event: MouseEvent, returnOrder: OrderReturn): void {
    const returnOrderUrl = this.router.serializeUrl(
      this.router.createUrlTree([
        '/logistics/return-orders',
        returnOrder.orderReturnId,
      ])
    );
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(returnOrderUrl, '_blank');
      return;
    }
    event.preventDefault();
    this.saveCurrentState();
    this.router.navigateByUrl(returnOrderUrl);
  }

  pageChanged(event: PageEvent): void {
    if (
      this.useClientSideSorting &&
      this.returnOrders.length >= this.totalReturnOrders
    ) {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      const startIndex = event.pageIndex * event.pageSize;
      const endIndex = startIndex + event.pageSize;
      this.dataSource.data = this.returnOrders.slice(startIndex, endIndex);
    } else {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      this.loadReturnOrders();
    }
  }

  sortData(sort: Sort): void {
    if (this.useClientSideSorting) {
      if (sort.direction === '') {
        this.dataSource.data = [...this.returnOrders].slice(
          this.filters.currentPage * this.filters.offset,
          (this.filters.currentPage + 1) * this.filters.offset
        );
        return;
      }
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction as 'asc' | 'desc';
      const data = [...this.returnOrders];
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'returnOrderId':
            return compare(a.orderReturnId, b.orderReturnId, isAsc);
          case 'customerId':
            return compare(a.customerId, b.customerId, isAsc);
          case 'productName':
            return compare(
              a.orderTracking?.product?.productName ?? '',
              b.orderTracking?.product?.productName ?? '',
              isAsc
            );
          case 'status':
            return compare(
              a.orderTracking?.orderTrackingStatusId ?? 0,
              b.orderTracking?.orderTrackingStatusId ?? 0,
              isAsc
            );
          case 'returnedDate':
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
      this.loadReturnOrders();
    }
  }

  saveCurrentState(): void {
    const state: OrderReturnsPageState = {
      filters: this.filters,
      currentPage: this.filters.currentPage,
      pageSize: this.filters.offset,
      sortField: this.filters.sortField,
      sortDirection: this.filters.sortDirection,
      scrollPosition: window.pageYOffset || document.documentElement.scrollTop,
    };
    this.navigationStateService.setOrderReturnsPageState(state);
  }

  private async restorePageState(state: OrderReturnsPageState): Promise<void> {
    this.filters = state.filters;

    const agent = this.deliveryAgents.find(
      (agent) => agent.deliveryAgentId === state.filters.deliveryAgentId
    );
    const hub = this.deliveryHubs.find(
      (hub) => hub.deliveryHubId === state.filters.deliveryHubId
    );

    this.filterForm.patchValue(
      {
        status: state.filters.orderStatusId || null,
        deliveryAgent: agent?.deliveryAgentId || null,
        deliveryHub: hub?.deliveryHubId || null,
        search: state.filters.searchValue || '',
      },
      { emitEvent: false }
    );

    this.loadReturnOrders();

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
      this.filterForm.get('status')?.value ||
      this.filterForm.get('deliveryAgent')?.value ||
      this.filterForm.get('deliveryHub')?.value ||
      this.filterForm.get('search')?.value
    );
  }

  formatDate(date: Date | string): string {
    const newDate = new Date(date);
    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(statusId: number): string {
    return ORDER_RETURN_STATUS_MAP[statusId] || 'Unknown';
  }

  getStatusClass(statusId: number): string {
    return OrderStatusClassMap[statusId] || '';
  }

  getDeliveryAgentName(agentId: number): string {
    const agent = this.deliveryAgents.find(
      (a) => a.deliveryAgentId === agentId
    );
    return agent ? agent.deliveryAgentName : '';
  }

  getDeliveryHubName(hubId: number): string {
    const hub = this.deliveryHubs.find((h) => h.deliveryHubId === hubId);
    return hub ? hub.deliveryHubName : '';
  }
}
