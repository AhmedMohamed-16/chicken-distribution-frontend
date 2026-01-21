import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseDay } from './close-day';

describe('CloseDay', () => {
  let component: CloseDay;
  let fixture: ComponentFixture<CloseDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloseDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloseDay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
