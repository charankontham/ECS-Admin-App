import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryHubsComponent } from './delivery-hubs.component';

describe('DeliveryHubsComponent', () => {
  let component: DeliveryHubsComponent;
  let fixture: ComponentFixture<DeliveryHubsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryHubsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryHubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
