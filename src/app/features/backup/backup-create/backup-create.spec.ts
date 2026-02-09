import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupCreate } from './backup-create';

describe('BackupCreate', () => {
  let component: BackupCreate;
  let fixture: ComponentFixture<BackupCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackupCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
