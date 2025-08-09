import { Component, Inject, OnInit, signal } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ExaminationCentreDetailsRequestDto,
  SchoolDetailsRequestDto,
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
import ExamCenterDialogData from '../../interface/exam-center-dialog-data';
import SchoolDetailsDialogData from '../../interface/school-details-dialog-data';

@Component({
  selector: 'app-assign-school-dialog',
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
  templateUrl: './assign-school-dialog.component.html',
  styleUrl: './assign-school-dialog.component.css',
})
export class AssignSchoolDialogComponent implements OnInit {
  readonly isEdit = this.data.rowData ? this.data.rowData : false;
  readonly title = this.isEdit ? 'Edit Exam Center' : 'New Exam Center';
  private readonly rowData: SchoolDetailsRequestDto = {};
  readonly vigyanKendraList: VigyanKendraDetails[] = [];
  readonly examCenterList: ExaminationCentreDetailsRequestDto[] = [];

  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AssignSchoolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolDetailsDialogData
  ) {
    this.rowData = this.data?.rowData ?? {};
    this.vigyanKendraList = this.data?.vigyanKendraList ?? [];
    this.examCenterList = this.data?.examCenterList ?? [];
    console.trace('dialog data : ');
    console.trace(this.data);
    console.trace(this.rowData);
  }
  ngOnInit(): void {
    console.trace('Vigyan Kendra Id');
    console.trace(this.rowData?.vigyanKendraId);
    this.form = this.fb.group({
      examCenterId: [this.rowData?.examCentreId ?? '', Validators.required],
    });
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
}
