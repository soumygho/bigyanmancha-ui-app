import { Component, Inject, OnInit, signal } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  SchoolDetailsResponseDto,
  StudentClassDetailsResponseDto,
  StudentResponseDto,
  VigyanKendraDetails,
} from '../../../api/models';
import { MatCommonModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
// For other controls you might use:
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import StudentEnrollmentDialogData from '../../interface/student-enrollment-dialog-data';
import EnrollmentDefault from '../../interface/enrollment-default';

@Component({
  selector: 'app-student-enrollment-form',
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
  templateUrl: './student-enrollment-form.component.html',
  styleUrl: './student-enrollment-form.component.css',
})
export class StudentEnrollmentFormComponent implements OnInit {
  readonly isEdit = this.data.rowData ? this.data.rowData : false;
  readonly title = this.isEdit ? 'Edit Enrollment' : 'New Enrollment';
  readonly genders = [
    { value: 'M', viewValue: 'Male' },
    { value: 'F', viewValue: 'Female' },
    { value: 'O', viewValue: 'Other' },
  ];
  private readonly rowData: StudentResponseDto = {};
  private readonly enrollmentDefault: EnrollmentDefault | undefined = undefined;
  readonly classList: StudentClassDetailsResponseDto[] = [];
  readonly schoolList: SchoolDetailsResponseDto[] = [];
  readonly vigyanKendraList: VigyanKendraDetails[] = [];
  readonly filteredSchoolList = signal<SchoolDetailsResponseDto[]>([]);
  isAdminUser = false;

  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StudentEnrollmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudentEnrollmentDialogData
  ) {
    this.rowData = this.data?.rowData ?? {};
    this.classList = this.data?.classList ?? [];
    this.schoolList = this.data?.schoolList ?? [];
    this.vigyanKendraList = this.data?.vigyanKendraList ?? [];
    this.isAdminUser = this.data.isAdminUser;
    this.enrollmentDefault = this.data.preference;
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      vigyanKendraId: [this.rowData?.vigyanKendraId ?? '', Validators.required],
      name: [this.rowData?.name ?? '', Validators.required],
      sex: [this.rowData?.sex ?? 'M', Validators.required],
      roll: [this.rowData?.roll ?? '', Validators.required],
      number: [this.rowData?.number ?? '', Validators.required],
      school: [this.rowData?.schoolId ?? '', Validators.required],
      class: [this.rowData?.classId ?? '', Validators.required],
    });
    this.setFilteredSchools(this.rowData?.vigyanKendraId);
    this.initializeForm();
  }

  private initializeForm() {
    if (this.enrollmentDefault) {
      const vigyanKendraDD = this.form?.get('vigyanKendraId');
      const schoolDD = this.form?.get('school');
      const classDD = this.form?.get('class');

      if (this.enrollmentDefault.vigyanKendraId) {
        vigyanKendraDD.patchValue(this.enrollmentDefault.vigyanKendraId);
        this.setFilteredSchools(Number(this.enrollmentDefault.vigyanKendraId));
        //schoolDD.patchValue(this.enrollmentDefault.schoolId);
        this.form.patchValue({ school: this.enrollmentDefault.schoolId });
      }
      if (this.enrollmentDefault.classId) {
        //classDD.patchValue(this.enrollmentDefault.classId);
        this.form.patchValue({ class: this.enrollmentDefault.classId });
      }
    }
    if (this.vigyanKendraList.length === 1) {
      const vigyanKendraDD = this.form?.get('vigyanKendraId');
      vigyanKendraDD?.patchValue(this.vigyanKendraList.at(0)?.id);
      this.filteredSchoolList.set(
        this.schoolList.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
      );
    }
    if (!this.isEdit) {
      const rollText = this.form?.get('roll');
      rollText?.patchValue('NA');
      const numberText = this.form?.get('number');
      numberText?.patchValue('NA');
    }
    if (!this.isAdminUser) {
      const rollText = this.form?.get('roll');
      rollText.disable();
      const numberText = this.form?.get('number');
      numberText.disable();
    }
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  resetForm() {
    this.form.reset();
    this.initializeForm();
  }
  onCancel(): void {
    this.resetForm();
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }

  private setFilteredSchools(id: number | undefined): void {
    if (id) {
      let filteredList = [];
      filteredList =
        this.schoolList.filter((school) => school.vigyanKendraId === id) ?? [];
      this.filteredSchoolList.set(
        filteredList.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
      );
    }
  }

  setVigyanKendraFilter(event: any) {
    const value = event.value;
    this.setFilteredSchools(value);
  }
}
