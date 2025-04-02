import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ProductCategoryService } from '../../../core/services/product-category.service';

@Component({
  selector: 'app-product-category',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css',
})
export class ProductCategoryComponent {
  private categoryService = inject(ProductCategoryService);
  private fb = inject(FormBuilder);

  categories = signal<any[]>([]);
  categoryForm: FormGroup;
  isEditing = signal(false);
  editingId: number | null = null;

  constructor() {
    this.categoryForm = this.fb.group({
      name: [''],
      description: [''],
    });
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService
      .getAll()
      .subscribe((data) => this.categories.set(data));
  }

  submitForm() {
    if (this.isEditing()) {
      // this.categoryService
      //   .update(this.editingId!, this.categoryForm.value)
      //   .subscribe(() => {
      //     this.loadCategories();
      //     this.resetForm();
      //   });
    } else {
      // this.categoryService.create(this.categoryForm.value).subscribe(() => {
      //   this.loadCategories();
      //   this.resetForm();
      // });
    }
  }

  editCategory(category: any) {
    this.isEditing.set(true);
    this.editingId = category.id;
    this.categoryForm.patchValue(category);
  }

  deleteCategory(id: number) {
    this.categoryService.delete(id).subscribe(() => this.loadCategories());
  }

  resetForm() {
    this.categoryForm.reset();
    this.isEditing.set(false);
    this.editingId = null;
  }
}
