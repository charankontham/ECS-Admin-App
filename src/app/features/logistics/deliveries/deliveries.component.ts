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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import {
  OrderTracking,
  OrderTrackingFilters,
} from '../../../core/models/order.model';
import { OrderTrackingService } from '../../../core/services/order-tracking.service';
import { DeliveryAgentService } from '../../../core/services/delivery-agent.service';
import { DeliveryAgent } from '../../../core/models/delivery.model';
import { catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';
import {
  compare,
  ORDER_TRACKING_STATUS_MAP,
  ORDER_TRACKING_TYPE_MAP,
  OrderStatusClassMap,
} from '../../../core/util/util';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-deliveries',
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
  templateUrl: './deliveries.component.html',
  styleUrl: './deliveries.component.css',
})
export class DeliveriesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'trackingId',
    'orderType',
    'status',
    'agent',
    'estimatedDate',
  ];
  dataSource: MatTableDataSource<OrderTracking>;
  filterForm: FormGroup;
  isLoading = true;
  totalDeliveries = 0;
  useClientSideSorting = true;
  deliveries: OrderTracking[] = [];
  deliveryAgents: DeliveryAgent[] = [];
  filteredAgents: DeliveryAgent[] = [];
  agentSearchControl = '';

  statusOptions = Object.entries(ORDER_TRACKING_STATUS_MAP).map(
    ([key, value]) => ({
      value: Number(key),
      label: value,
    })
  );

  typeOptions = Object.entries(ORDER_TRACKING_TYPE_MAP).map(([key, value]) => ({
    value: Number(key),
    label: value,
  }));

  filters: OrderTrackingFilters = {
    type: 'orderTracking',
    currentPage: 0,
    offset: 5,
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<OrderTracking>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private orderTrackingService: OrderTrackingService,
    private deliveryAgentService: DeliveryAgentService
  ) {
    this.dataSource = new MatTableDataSource<OrderTracking>([]);
    this.filterForm = this.fb.group({
      search: [''],
      orderTrackingType: [null],
      orderTrackingStatusId: [null],
      estimatedDeliveryDate: [null],
      deliveryAgents: [[]],
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadDeliveryAgents();
    this.loadDeliveries();

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
          orderTrackingType: values.orderTrackingType || null,
          orderTrackingStatusId: values.orderTrackingStatusId || null,
          estimatedDeliveryDate: values.estimatedDeliveryDate || null,
          deliveryAgents:
            values.deliveryAgents && values.deliveryAgents.length > 0
              ? values.deliveryAgents
              : null,
          searchValue: values.search.trim() !== '' ? values.search : null,
          currentPage: 0,
        };
        this.loadDeliveries();
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

  loadDeliveries(): void {
    this.isLoading = true;
    this.orderTrackingService
      .getAllOrderTrackingsBypagination(this.filters)
      .subscribe({
        next: (response) => {
          this.deliveries = response.items;
          this.dataSource.data = response.items;
          this.totalDeliveries = response.totalCount;
          if (this.useClientSideSorting && this.sort) {
            this.dataSource.sort = this.sort;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading deliveries : ', error);
          this.isLoading = false;
        },
      });
  }

  loadDeliveryAgents(): void {
    this.deliveryAgentService.getAllDeliveryAgents().subscribe({
      next: (agents) => {
        this.deliveryAgents = agents;
        this.filteredAgents = agents;
      },
      error: (error) => {
        console.error('Error loading delivery agents:', error);
      },
    });
  }

  filterAgents(): void {
    const searchTerm = this.agentSearchControl.toLowerCase();
    this.filteredAgents = this.deliveryAgents.filter(
      (agent) =>
        agent.deliveryAgentName.toLowerCase().includes(searchTerm) ||
        agent.deliveryAgentId?.toString().includes(searchTerm)
    );
  }

  clearAllFilters(): void {
    this.filterForm.reset({
      search: '',
      orderTrackingType: null,
      orderTrackingStatusId: null,
      estimatedDeliveryDate: null,
      deliveryAgents: [],
    });
    this.filters.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter(filterName: string): void {
    if (filterName === 'deliveryAgents') {
      this.filterForm.get(filterName)?.setValue([]);
    } else {
      this.filterForm.get(filterName)?.setValue(null);
    }
  }

  onDeliveryClick(event: MouseEvent, delivery: OrderTracking): void {
    const deliveryUrl = this.router.serializeUrl(
      this.router.createUrlTree([
        '/logistics/deliveries',
        delivery.orderTrackingId,
      ])
    );
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      window.open(deliveryUrl, '_blank');
      return;
    }
    event.preventDefault();
    this.router.navigateByUrl(deliveryUrl);
  }

  pageChanged(event: PageEvent): void {
    if (
      this.useClientSideSorting &&
      this.deliveries.length >= this.totalDeliveries
    ) {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      const startIndex = event.pageIndex * event.pageSize;
      const endIndex = startIndex + event.pageSize;
      this.dataSource.data = this.deliveries.slice(startIndex, endIndex);
    } else {
      this.filters.currentPage = event.pageIndex;
      this.filters.offset = event.pageSize;
      this.loadDeliveries();
    }
  }

  sortData(sort: Sort): void {
    if (this.useClientSideSorting) {
      if (sort.direction === '') {
        this.dataSource.data = [...this.deliveries].slice(
          this.filters.currentPage * this.filters.offset,
          (this.filters.currentPage + 1) * this.filters.offset
        );
        return;
      }
      this.filters.sortField = sort.active;
      this.filters.sortDirection = sort.direction as 'asc' | 'desc';
      const data = [...this.deliveries];
      data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'trackingId':
            return compare(a.orderTrackingId, b.orderTrackingId, isAsc);
          case 'orderType':
            return compare(a.orderTrackingType, b.orderTrackingType, isAsc);
          case 'status':
            return compare(
              a.orderTrackingStatusId,
              b.orderTrackingStatusId,
              isAsc
            );
          case 'agent':
            return compare(
              a.deliveryAgent?.deliveryAgentName ?? '',
              b.deliveryAgent?.deliveryAgentName ?? '',
              isAsc
            );
          case 'estimatedDate':
            return compare(
              a.estimatedDeliveryDate,
              b.estimatedDeliveryDate,
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
      this.loadDeliveries();
    }
  }

  checkIsDefaultFilterForm(): boolean {
    const formValues = this.filterForm.value;
    return !(
      formValues.search ||
      formValues.orderTrackingType ||
      formValues.orderTrackingStatusId ||
      formValues.estimatedDeliveryDate ||
      (formValues.deliveryAgents && formValues.deliveryAgents.length > 0)
    );
  }

  getStatusLabel(statusId: number): string {
    return ORDER_TRACKING_STATUS_MAP[statusId] || 'Unknown';
  }

  getStatusClass(statusId: number): string {
    return OrderStatusClassMap[statusId] || '';
  }

  getTypeLabel(typeId: number): string {
    return ORDER_TRACKING_TYPE_MAP[typeId] || 'Unknown';
  }

  getSelectedAgentNames(): string {
    const selectedIds = this.filterForm.get('deliveryAgents')?.value || [];
    const selectedAgents = this.deliveryAgents.filter((agent) =>
      selectedIds.includes(agent.deliveryAgentId)
    );
    return selectedAgents.map((agent) => agent.deliveryAgentName).join(', ');
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    var newDate = new Date(date);
    if (!date.toString().includes('Z')) {
      newDate = new Date(date.toString() + 'Z');
    }
    return newDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
