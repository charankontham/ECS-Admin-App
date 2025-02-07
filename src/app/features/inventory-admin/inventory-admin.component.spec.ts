import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAdminComponent } from './inventory-admin.component';

describe('InventoryAdminComponent', () => {
  let component: InventoryAdminComponent;
  let fixture: ComponentFixture<InventoryAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
