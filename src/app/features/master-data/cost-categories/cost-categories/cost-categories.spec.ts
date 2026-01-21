import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCategories } from './cost-categories';

describe('CostCategories', () => {
  let component: CostCategories;
  let fixture: ComponentFixture<CostCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostCategories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
