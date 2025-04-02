import { NgFor, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Admin } from '../../../core/models/admin.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-inventory-dashboard',
  imports: [NgFor],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css',
})
export class InventoryDashboardComponent implements OnInit {
  recentProducts: Product[] = [];

  outOfStockProducts = [
    { name: 'Product 3', category: 'Category 3' },
    { name: 'Product 4', category: 'Category 4' },
  ];

  highSellingProducts = [
    { name: 'Product 5', unitsSold: 500 },
    { name: 'Product 6', unitsSold: 400 },
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      Chart.register(...registerables);
      this.createSalesTrendsChart();
    }
    this.productService.getAllProducts().subscribe((products) => {
      this.recentProducts = products;
    });
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private productService: ProductService
  ) {}

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
}
