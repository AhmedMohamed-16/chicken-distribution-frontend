import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buyers } from './buyers';

describe('Buyers', () => {
  let component: Buyers;
  let fixture: ComponentFixture<Buyers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Buyers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buyers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
