import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeliveryHubComponent } from './view-delivery-hub.component';

describe('ViewDeliveryHubComponent', () => {
  let component: ViewDeliveryHubComponent;
  let fixture: ComponentFixture<ViewDeliveryHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeliveryHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDeliveryHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
