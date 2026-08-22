/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DefaultEnrollmentPreferenceComponent } from './default-enrollment-preference.component';

describe('DefaultEnrollmentPreferenceComponent', () => {
  let component: DefaultEnrollmentPreferenceComponent;
  let fixture: ComponentFixture<DefaultEnrollmentPreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultEnrollmentPreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultEnrollmentPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
