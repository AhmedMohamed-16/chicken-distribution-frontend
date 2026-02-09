import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupList } from './backup-list';

describe('BackupList', () => {
  let component: BackupList;
  let fixture: ComponentFixture<BackupList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackupList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
