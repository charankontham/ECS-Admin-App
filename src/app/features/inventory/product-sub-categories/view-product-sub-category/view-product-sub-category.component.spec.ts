import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductSubCategoryComponent } from './view-product-sub-category.component';

describe('ViewProductSubCategoryComponent', () => {
  let component: ViewProductSubCategoryComponent;
  let fixture: ComponentFixture<ViewProductSubCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProductSubCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewProductSubCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
