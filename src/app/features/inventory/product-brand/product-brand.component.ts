import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ProductBrandService } from '../../../core/services/product-brand.service';

@Component({
  selector: 'app-product-brand',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './product-brand.component.html',
  styleUrl: './product-brand.component.css',
})
export class ProductBrandComponent {
  private brandService = inject(ProductBrandService);
  private fb = inject(FormBuilder);

  brands = signal<any[]>([]);
  brandForm: FormGroup;
  isEditing = signal(false);
  editingId: number | null = null;

  constructor() {
    this.brandForm = this.fb.group({
      name: [''],
      description: [''],
    });
    this.loadBrands();
  }

  loadBrands() {
    this.brandService.getAll().subscribe((data) => this.brands.set(data));
  }

  submitForm() {
    if (this.isEditing()) {
      // this.brandService
      //   .update(this.editingId!, this.brandForm.value)
      //   .subscribe(() => {
      //     this.loadBrands();
      //     this.resetForm();
      //   });
    } else {
      // this.brandService.create(this.brandForm.value).subscribe(() => {
      //   this.loadBrands();
      //   this.resetForm();
      // });
    }
  }

  editBrand(brand: any) {
    this.isEditing.set(true);
    this.editingId = brand.id;
    this.brandForm.patchValue(brand);
  }

  deleteBrand(id: number) {
    this.brandService.delete(id).subscribe(() => this.loadBrands());
  }

  resetForm() {
    this.brandForm.reset();
    this.isEditing.set(false);
    this.editingId = null;
  }
}
