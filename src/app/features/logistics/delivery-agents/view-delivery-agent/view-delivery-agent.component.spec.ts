import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeliveryAgentComponent } from './view-delivery-agent.component';

describe('ViewDeliveryAgentComponent', () => {
  let component: ViewDeliveryAgentComponent;
  let fixture: ComponentFixture<ViewDeliveryAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeliveryAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDeliveryAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
