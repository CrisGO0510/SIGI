import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrDocuments } from './hr-documents';

describe('HrDocuments', () => {
  let component: HrDocuments;
  let fixture: ComponentFixture<HrDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HrDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
