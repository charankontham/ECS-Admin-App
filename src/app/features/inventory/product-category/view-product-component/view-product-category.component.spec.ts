import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductCategory } from './view-product-category.component';

describe('ViewProductComponentComponent', () => {
  let component: ViewProductCategory;
  let fixture: ComponentFixture<ViewProductCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProductCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewProductCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
