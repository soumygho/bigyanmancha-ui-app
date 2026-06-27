import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudentClassDetailsResponseDto } from '../../../api/models';
import { MatCommonModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
// For other controls you might use:
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import VigyanKendraDialogData from '../../interface/vigyan-kendra-dialog-data';

@Component({
  selector: 'app-vigyan-kendra-form',
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
  templateUrl: './vigyan-kendra-form.component.html',
  styleUrl: './vigyan-kendra-form.component.css',
})
export class VigyanKendraFormComponent implements OnInit {
  readonly isEdit = this.data ? this.data : false;
    readonly title = this.isEdit ? 'Edit Student Class' : 'New Student Class';
    private readonly rowData: StudentClassDetailsResponseDto = {};

    form: any;

    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<VigyanKendraFormComponent>,
      @Inject(MAT_DIALOG_DATA) public data: VigyanKendraDialogData
    ) {
      this.rowData = this.data?.rowData ?? {};
    }
    ngOnInit(): void {
      this.form = this.fb.group({
        name: [this.data?.rowData?.name ?? '', Validators.required],
        code: [this.data?.rowData?.code ?? '', Validators.required],
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
