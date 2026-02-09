import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclePerformance } from './vehicle-performance';

describe('VehiclePerformance', () => {
  let component: VehiclePerformance;
  let fixture: ComponentFixture<VehiclePerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclePerformance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiclePerformance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
