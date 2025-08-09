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
  readonly classList: StudentClassDetailsResponseDto[] = [];
  readonly schoolList: SchoolDetailsResponseDto[] = [];
  readonly vigyanKendraList: VigyanKendraDetails[] = [];
  readonly filteredSchoolList = signal<SchoolDetailsResponseDto[]>([]);

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
    console.trace('dialog data : ');
    console.trace(this.data);
    console.trace(this.rowData);
  }
  ngOnInit(): void {
    console.trace('Vigyan Kendra Id');
    console.trace(this.rowData?.vigyanKendraId);
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
    if(!this.isEdit) {
      const rollText = this.form?.get('roll');
      rollText?.patchValue('NA');
      const numberText = this.form?.get('number');
      numberText?.patchValue('NA');
    }
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  resetForm() {
    this.form.reset();
  }
  onCancel(): void {
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }

  private setFilteredSchools(id: number | undefined): void {
    console.trace('Vigyan kendra id : '+id);
    if (id) {
      let filteredList = [];
      filteredList =
        this.schoolList.filter((school) => school.vigyanKendraId === id) ?? [];
      this.filteredSchoolList.set(filteredList);
    }
  }

  setVigyanKendraFilter(event: any) {
    console.trace(event);
    const value = event.value;
    this.setFilteredSchools(value);
  }
}
