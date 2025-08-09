import { Component, Inject, OnInit, signal } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
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

@Component({
  selector: 'app-admin-user-form',
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
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.css',
})
export class AdminUserFormComponent {
  readonly isEdit = this.data.rowData ? this.data.rowData : false;
  readonly title = this.isEdit ? 'Edit User Details' : 'New User';
  private readonly rowData: UserDetailsResponseDto = {};
  readonly vigyanKendraList: VigyanKendraDetails[] = [];
  readonly roles = [
    {
      value: 'admin',
      displayname: 'ADMIN',
    },
    {
      value: 'vigyankendra',
      displayname: 'VIGYAN KENDRA',
    },
    /*{
      value: 'school',
      displayname: 'SCHOOL',
    },
    {
      value: 'none',
      displayname: 'NONE',
    },*/
  ];
  form: FormGroup | undefined;
  readonly shouldShowVigyanKendraDropdown = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AdminUserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailsDialogData
  ) {
    this.rowData = this.data?.rowData ?? {};
    this.vigyanKendraList = this.data?.vigyanKendraList ?? [];
    console.trace('dialog data : ');
    console.trace(this.data);
    console.trace(this.rowData);
  }
  ngOnInit(): void {
    console.trace('Vigyan Kendra Id');
    console.trace(this.rowData?.vigyanKendraId);
    let role = this.resolveRole();
    this.form = this.fb.group({
      vigyanKendraId: [this.rowData?.vigyanKendraId ?? '', Validators.required],
      userName: [this.rowData?.username ?? '', Validators.required],
      email: [this.rowData?.email ?? '', Validators.required],
      password: ['', !this.isEdit ? Validators.required : null],
      role: [role, Validators.required],
    });

    if(!this.isEdit) {
      const emailText = this.form?.get('email');
      emailText?.patchValue('test@test.com')
    }
  }

  resolveRole(): string {
    let role = this.rowData?.roles ? this.rowData.roles[0] : 'none';
    if(role === 'ROLE_VIGYANKENDRA') {
      return 'vigyankendra';
    } else if (role === 'ROLE_ADMIN') {
      return 'admin';
    }
    return role;
  }

  save() {
    if (this.form?.invalid) return;
    this.dialogRef.close(this.form?.value);
  }

  resetForm() {
    this.form?.reset();
  }
  onCancel(): void {
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }

  handleUserTypeChange(event: any) {
    const value = event.value;
    if (value === 'admin') {
      this.shouldShowVigyanKendraDropdown.set(false);
      this.clearValidatorForVigyanKendra();
    } else if (value === 'vigyankendra') {
      this.shouldShowVigyanKendraDropdown.set(true);
      this.applyValidatorForVigyanKendra();
    }
  }

  applyValidatorForVigyanKendra() {
    const vigyanKendraDD = this.form?.get('vigyanKendraId');
    vigyanKendraDD?.setValidators([Validators.required]);
  }

   clearValidatorForVigyanKendra() {
    const vigyanKendraDD = this.form?.get('vigyanKendraId');
    vigyanKendraDD?.patchValue("0");
    vigyanKendraDD?.clearValidators();
  }
}
