import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesReportComponent } from './packages-report.component';

describe('PackagesReportComponent', () => {
  let component: PackagesReportComponent;
  let fixture: ComponentFixture<PackagesReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagesReportComponent]
    });
    fixture = TestBed.createComponent(PackagesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
