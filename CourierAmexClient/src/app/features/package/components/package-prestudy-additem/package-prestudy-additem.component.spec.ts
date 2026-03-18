import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagePrestudyAdditemComponent } from './package-prestudy-additem.component';

describe('PackagePrestudyAdditemComponent', () => {
  let component: PackagePrestudyAdditemComponent;
  let fixture: ComponentFixture<PackagePrestudyAdditemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PackagePrestudyAdditemComponent]
    });
    fixture = TestBed.createComponent(PackagePrestudyAdditemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
