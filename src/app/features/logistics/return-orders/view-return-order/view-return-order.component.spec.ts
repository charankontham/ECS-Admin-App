import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReturnOrderComponent } from './view-return-order.component';

describe('ViewReturnOrderComponent', () => {
  let component: ViewReturnOrderComponent;
  let fixture: ComponentFixture<ViewReturnOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReturnOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewReturnOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
