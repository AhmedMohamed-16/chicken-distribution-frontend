import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportLosses } from './transport-losses';

describe('TransportLosses', () => {
  let component: TransportLosses;
  let fixture: ComponentFixture<TransportLosses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportLosses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportLosses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
