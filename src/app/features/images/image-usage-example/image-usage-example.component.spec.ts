import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUsageExampleComponent } from './image-usage-example.component';

describe('ImageManagerComponent', () => {
  let component: ImageUsageExampleComponent;
  let fixture: ComponentFixture<ImageUsageExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUsageExampleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUsageExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
