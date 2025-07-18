import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSubCategoriesComponent } from './product-sub-categories.component';

describe('ProductSubCategoriesComponent', () => {
  let component: ProductSubCategoriesComponent;
  let fixture: ComponentFixture<ProductSubCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSubCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSubCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
