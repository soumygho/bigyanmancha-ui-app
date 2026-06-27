import { Component, Inject, OnInit, signal } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  SchoolDetailsResponseDto,
  ExaminationCentreDetailsRequestDto,
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

@Component({
  selector: 'app-exam-center-form',
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
  templateUrl: './exam-center-form.component.html',
  styleUrl: './exam-center-form.component.css',
})
export class ExamCenterFormComponent implements OnInit {
  readonly isEdit = this.data.rowData ? this.data.rowData : false;
  readonly title = this.isEdit ? 'Edit Exam Center' : 'New Exam Center';
  private readonly rowData: ExaminationCentreDetailsRequestDto = {};
  readonly vigyanKendraList: VigyanKendraDetails[] = [];
  readonly schoolList: SchoolDetailsResponseDto[] = [];
  readonly filteredSchoolList = signal<SchoolDetailsResponseDto[]>([]);

  form: any;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExamCenterFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExamCenterDialogData
  ) {
    this.rowData = this.data?.rowData ?? {};
    this.vigyanKendraList = this.data?.vigyanKendraList ?? [];
    this.schoolList = this.data?.schoolList ?? [];
  }
  ngOnInit(): void {
    this.form = this.fb.group({
      vigyanKendraId: [this.rowData?.vigyanKendraId ?? '', Validators.required],
      schoolDetailsId: [
        this.rowData?.schoolDetailsId ?? '',
        Validators.required,
      ],
      name: [this.rowData?.name ?? '', Validators.required],
    });
    this.setFilteredSchools(this.form.value.vigyanKendraId);
    this.initializeForm();
  }

  private initializeForm() {
    if (this.vigyanKendraList.length === 1) {
      const vigyanKendraDD = this.form?.get('vigyanKendraId');
      vigyanKendraDD?.patchValue(this.vigyanKendraList.at(0)?.id);
      this.filteredSchoolList.set(
        this.schoolList.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
      );
    }
  }

  private setFilteredSchools(id: number): void {
    let filteredList = [];
    filteredList =
      this.schoolList.filter((school) => school.vigyanKendraId === id) ?? [];
    this.filteredSchoolList.set(
      filteredList.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
    );
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  resetForm() {
    this.initializeForm();
    this.form.reset();
  }
  onCancel(): void {
    this.resetForm();
    this.dialogRef.close(); // or pass data like this.dialogRef.close(false)
  }

  setVigyanKendraFilter(event: any) {
    const value = event.value;
    this.setFilteredSchools(value);
  }
}
