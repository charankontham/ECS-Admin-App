import { NgFor, isPlatformBrowser } from '@angular/common';
import { Component, Inject, type OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PLATFORM_ID } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import type {
  Product,
  ProductFilters,
} from '../../../core/models/product.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import {
  MatPaginatorModule,
  type PageEvent,
} from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface HighSellingProduct {
  name: string;
  unitsSold: number;
  category?: string;
  revenue: number;
}

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [
    NgFor,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatProgressBarModule,
    RouterModule,
  ],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboardComponent implements OnInit {
  recentProducts: Product[] = [];
  outOfStockProducts: Product[] = [];
  highSellingProducts: HighSellingProduct[] = [];

  // Mat Table Data Sources
  outOfStockDataSource = new MatTableDataSource<Product>([]);
  highSellingDataSource = new MatTableDataSource<HighSellingProduct>([]);

  // Table Columns
  outOfStockColumns: string[] = ['name', 'category', 'dateModified', 'price'];
  highSellingColumns: string[] = ['name', 'unitsSold', 'category', 'revenue'];

  // Pagination
  totalOutOfStockProducts = 0;
  totalHighSellingProducts = 0;
  outOfStockPageSize = 5;
  highSellingPageSize = 5;
  outOfStockCurrentPage = 0;
  highSellingCurrentPage = 0;

  // platformId: Object;
  productService: ProductService;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    productService: ProductService,
    private router: Router
  ) {
    this.platformId = platformId;
    this.productService = productService;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Chart.register(...registerables);
      this.createSalesTrendsChart();
    }
    this.loadRecentProducts();
    this.loadOutOfStockProducts();
    this.loadHighSellingProducts();
  }

  loadRecentProducts() {
    const filters: ProductFilters = {
      type: 'product',
      offset: 10,
      currentPage: 0,
      sortField: 'dateAdded',
      sortDirection: 'desc',
    };
    this.productService
      .getAllProductsBypagination(filters)
      .subscribe((products) => {
        this.recentProducts = products.content;
      });
  }

  loadOutOfStockProducts() {
    this.productService
      .getAllOutOfStockProductsBypagination(
        this.outOfStockCurrentPage,
        this.outOfStockPageSize
      )
      .subscribe((products) => {
        this.outOfStockProducts = products.content;
        this.outOfStockDataSource.data = products.content;
        this.totalOutOfStockProducts = products.totalElements;
      });
  }

  loadHighSellingProducts() {
    // Mock data for high selling products with pagination
    const allHighSellingProducts: HighSellingProduct[] = [
      {
        name: 'Product A',
        unitsSold: 500,
        category: 'Electronics',
        revenue: 25000,
      },
      {
        name: 'Product B',
        unitsSold: 450,
        category: 'Clothing',
        revenue: 22500,
      },
      {
        name: 'Product C',
        unitsSold: 400,
        category: 'Electronics',
        revenue: 20000,
      },
      {
        name: 'Product D',
        unitsSold: 380,
        category: 'Home & Garden',
        revenue: 19000,
      },
      { name: 'Product E', unitsSold: 350, category: 'Sports', revenue: 17500 },
      {
        name: 'Product F',
        unitsSold: 320,
        category: 'Electronics',
        revenue: 16000,
      },
      { name: 'Product G', unitsSold: 300, category: 'Books', revenue: 15000 },
      {
        name: 'Product H',
        unitsSold: 280,
        category: 'Clothing',
        revenue: 14000,
      },
      {
        name: 'Product I',
        unitsSold: 260,
        category: 'Electronics',
        revenue: 13000,
      },
      {
        name: 'Product J',
        unitsSold: 240,
        category: 'Home & Garden',
        revenue: 12000,
      },
    ];

    // Simulate pagination
    const startIndex = this.highSellingCurrentPage * this.highSellingPageSize;
    const endIndex = startIndex + this.highSellingPageSize;
    const paginatedProducts = allHighSellingProducts.slice(
      startIndex,
      endIndex
    );

    this.highSellingProducts = paginatedProducts;
    this.highSellingDataSource.data = paginatedProducts;
    this.totalHighSellingProducts = allHighSellingProducts.length;
  }

  onOutOfStockPageChange(event: PageEvent): void {
    this.outOfStockCurrentPage = event.pageIndex;
    this.outOfStockPageSize = event.pageSize;
    this.loadOutOfStockProducts();
  }

  onHighSellingPageChange(event: PageEvent): void {
    this.highSellingCurrentPage = event.pageIndex;
    this.highSellingPageSize = event.pageSize;
    this.loadHighSellingProducts();
  }

  createSalesTrendsChart() {
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        const ctx = document.getElementById(
          'salesTrendsChart'
        ) as HTMLCanvasElement;
        if (ctx) {
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['January', 'February', 'March', 'April', 'May', 'June'],
              datasets: [
                {
                  label: 'Sales',
                  data: [150, 200, 170, 220, 260, 300],
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 2,
                  fill: true,
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        }
      }
    }, 0);
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/inventory/products', product.productId]);
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
