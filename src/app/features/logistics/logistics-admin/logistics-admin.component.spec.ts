import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticsAdminComponent } from './logistics-admin.component';

describe('LogisticsAdminComponent', () => {
  let component: LogisticsAdminComponent;
  let fixture: ComponentFixture<LogisticsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogisticsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogisticsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
