import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyOperation } from './daily-operation';

describe('DailyOperation', () => {
  let component: DailyOperation;
  let fixture: ComponentFixture<DailyOperation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyOperation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyOperation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
