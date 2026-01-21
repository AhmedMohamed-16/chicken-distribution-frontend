import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartDay } from './start-day';

describe('StartDay', () => {
  let component: StartDay;
  let fixture: ComponentFixture<StartDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartDay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
