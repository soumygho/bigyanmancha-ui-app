import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  SchoolDetailsResponseDto,
  StudentClassDetailsResponseDto,
  VigyanKendraDetails,
} from '../../../api/models';
import { SchoolDetailsApiService } from '../../../api/services';
import { LocalStorageService } from '../../services/local-storage.service';
import EnrollmentDefault from '../../interface/enrollment-default';
import { NotificationService } from '../../services/notification.service';
import { DefaultEnrollmentPreferenceDilogueData } from '../../interface/default-enrollment-preference-dilogue-data';

@Component({
  selector: 'app-default-enrollment-preference',
  templateUrl: './default-enrollment-preference.component.html',
  styleUrls: ['./default-enrollment-preference.component.css'],
  standalone: true,
  imports: [
    MatCommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class DefaultEnrollmentPreferenceComponent implements OnInit {
  private readonly schoolDetailsService = inject(SchoolDetailsApiService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly notficationService = inject(NotificationService);

  readonly schoolDetailsList = signal<SchoolDetailsResponseDto[]>([]);
  readonly defaultClass = signal<undefined | null | string>(undefined);
  readonly defaultSchool = signal<undefined | null | string>(undefined);
  readonly defaultVigyanKendra = signal<undefined | null | string>(undefined);
  readonly defaultSchoolList = signal<SchoolDetailsResponseDto[]>([]);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);
  readonly studentClassDetailsList = signal<StudentClassDetailsResponseDto[]>(
    [],
  );
  form: any;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DefaultEnrollmentPreferenceComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: DefaultEnrollmentPreferenceDilogueData,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      vigyanKendraId: [''],
      schoolId: [''],
      classId: [''],
    });
    this.initializeDefaultEnrollmentConfig();
  }

  initializeDefaultEnrollmentConfig() {
    if (this.localStorageService.getEnrollmentPreference()) {
      var config = this.localStorageService.getEnrollmentPreference();
      this.defaultVigyanKendra.set(config?.vigyanKendraId);
      this.schoolDetailsService.getAllSchoolsByBigyanKendra({ vigyanKendraId: parseInt(config?.vigyanKendraId ?? '0') }).subscribe((response) => {
        this.defaultSchoolList.set(response);
      });
      this.defaultClass.set(config?.classId);
      this.defaultSchool.set(config?.schoolId);
      this.form
        ?.get('vigyanKendraId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.vigyanKendraId,
        );
      this.form
        ?.get('schoolId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.schoolId,
        );
      this.form
        ?.get('classId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.classId,
        );
    }
    this.vigyanKendraList.set([...this.data.vigyanKendraList]);
    this.studentClassDetailsList.set([...this.data.studentClassDetailsList]);
  }

  setDefaultEnrollmentConfig() {
    if (
      !this.defaultClass() ||
      !this.defaultSchool() ||
      !this.defaultVigyanKendra()
    ) {
      this.notficationService.show(
        `Please select vigyankendra, school and class to set deafult.`,
      );
    } else {
      let config: EnrollmentDefault = {
        vigyanKendraId: this.defaultVigyanKendra(),
        schoolId: this.defaultSchool(),
        classId: this.defaultClass(),
      };
      this.localStorageService.setEnrollmentPreference(config);
      this.notficationService.show(
        `Default preference has been set, no need to select these in the form.`,
      );
    }
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }

  setDefaultVigyanKendra(event: any) {
    this.defaultVigyanKendra.set(event.value);
    this.schoolDetailsService
      .getAllSchoolsByBigyanKendra({ vigyanKendraId: event.value })
      .subscribe((response) => {
        this.defaultSchoolList.set(response);
      });
  }

  setDefaultClass(event: any) {
    this.defaultClass.set(event.value);
  }
  setDefaultSchool(event: any) {
    this.defaultSchool.set(event.value);
  }
  resetForm() {
    this.form.reset();
  }
  onCancel(): void {
    this.resetForm();
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }
}
