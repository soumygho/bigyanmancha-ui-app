/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminVigyanKendraPageComponent } from './admin-vigyan-kendra-page.component';

describe('AdminVigyanKendraPageComponent', () => {
  let component: AdminVigyanKendraPageComponent;
  let fixture: ComponentFixture<AdminVigyanKendraPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminVigyanKendraPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminVigyanKendraPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
