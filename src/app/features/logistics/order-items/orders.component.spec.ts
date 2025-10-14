import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderItemsComponent } from './orders.component';

describe('OrderItemsComponent', () => {
  let component: OrderItemsComponent;
  let fixture: ComponentFixture<OrderItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
