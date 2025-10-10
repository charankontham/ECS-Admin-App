import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryAgentsComponent } from './delivery-agents.component';

describe('DeliveryAgentsComponent', () => {
  let component: DeliveryAgentsComponent;
  let fixture: ComponentFixture<DeliveryAgentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryAgentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
