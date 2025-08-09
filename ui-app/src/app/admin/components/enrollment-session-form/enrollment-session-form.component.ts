import { Component, Inject, OnInit, signal } from '@angular/core';
import {
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  EnrollmentSession,
  UserDetailsResponseDto,
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
import UserDetailsDialogData from '../../interface/user-details-dialog-data';
import EnrollmentSessionDialogData from '../../interface/enrollment-session-dialog-data';

@Component({
  selector: 'app-enrollment-session-form',
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
  templateUrl: './enrollment-session-form.component.html',
  styleUrl: './enrollment-session-form.component.css',
})
export class EnrollmentSessionFormComponent {
  readonly isEdit = this.data.rowData ? this.data.rowData : false;
  readonly title = this.isEdit ? 'Edit Enrollment Session Details' : 'New Enrollment Session';
  private readonly rowData: EnrollmentSession = {};
  form: FormGroup | undefined;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EnrollmentSessionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EnrollmentSessionDialogData
  ) {
    this.rowData = this.data?.rowData ?? {};
    console.trace('dialog data : ');
    console.trace(this.data);
    console.trace(this.rowData);
  }
  ngOnInit(): void {
    console.trace('Vigyan Kendra Id');
    this.form = this.fb.group({
      name: [this.rowData?.name ?? '', Validators.required],
      year: [this.rowData?.year ?? '', Validators.required],
    });
  }

  save() {
    if (this.form?.invalid) return;
    let formData = {...this.form?.value};
    if(this.isEdit) {
      formData = {...formData, id: this.rowData.id}
    }
    this.dialogRef.close(formData);
  }

  resetForm() {
    this.form?.reset();
  }
  onCancel(): void {
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }
}
