import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyCosts } from './daily-costs';

describe('DailyCosts', () => {
  let component: DailyCosts;
  let fixture: ComponentFixture<DailyCosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyCosts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyCosts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
