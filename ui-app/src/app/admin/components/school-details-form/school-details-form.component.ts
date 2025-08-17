import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  SchoolDetailsResponseDto,
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
import SchoolDetailsDialogData from '../../interface/school-details-dialog-data';

@Component({
  selector: 'app-school-details-form',
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
  templateUrl: './school-details-form.component.html',
  styleUrl: './school-details-form.component.css',
})
export class SchoolDetailsFormComponent implements OnInit {
  readonly isEdit = this.data.rowData ? this.data.rowData : false;
  readonly title = this.isEdit ? 'Edit School Details' : 'New School';
  private readonly rowData: SchoolDetailsResponseDto = {};
  readonly vigyanKendraList: VigyanKendraDetails[] = [];

  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SchoolDetailsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SchoolDetailsDialogData
  ) {
    this.rowData = this.data?.rowData ?? {};
    this.vigyanKendraList = this.data?.vigyanKendraList ?? [];
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      vigyanKendraId: [this.rowData?.vigyanKendraId ?? '', Validators.required],
      name: [this.rowData?.name ?? '', Validators.required],
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
    this.resetForm();
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }
}
