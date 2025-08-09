import { Component, Inject, OnInit, signal } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExaminationCentreDetailsRequestDto } from '../../../api/models';
import { MatCommonModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
// For other controls you might use:
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import ExamCenterDialogData from '../../interface/exam-center-dialog-data';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-exam-center-details-dialog',
  standalone: true,
  imports: [
    MatCommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatListModule,
    CommonModule,
  ],
  templateUrl: './exam-center-details-dialog.component.html',
  styleUrl: './exam-center-details-dialog.component.css',
})
export class ExamCenterDetailsDialogComponent {
  readonly title = 'Associated Schools';
  private readonly rowData: ExaminationCentreDetailsRequestDto = {};
  readonly schoolNames: string[] = [];
  readonly isEmptySchools: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<ExamCenterDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExamCenterDialogData
  ) {
    this.rowData = this.data?.rowData ?? {};
    this.schoolNames = this.rowData.schoolNames ?? [];
    this.isEmptySchools = this.schoolNames.length === 0;
    console.trace('dialog data : ');
    console.trace(this.data);
    console.trace(this.rowData);
  }
  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }
}
