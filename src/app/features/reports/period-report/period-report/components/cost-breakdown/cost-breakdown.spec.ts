import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostBreakdown } from './cost-breakdown';

describe('CostBreakdown', () => {
  let component: CostBreakdown;
  let fixture: ComponentFixture<CostBreakdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostBreakdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostBreakdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
