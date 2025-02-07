import { Component, inject } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private productService = inject(ProductService);
  products: Product[] = [];

  constructor() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll().subscribe((data) => (this.products = data));
  }

  deleteProduct(id: number) {
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }
}
