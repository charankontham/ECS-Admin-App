import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeliveryComponent } from './view-delivery.component';

describe('ViewDeliveryComponent', () => {
  let component: ViewDeliveryComponent;
  let fixture: ComponentFixture<ViewDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeliveryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
