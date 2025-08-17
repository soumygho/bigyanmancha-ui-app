import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ApiModule } from '../../../api/api.module';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
} from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import {
  ExaminationCentreDetailsApiService,
  StudentEnrollmentApiService,
} from '../../../api/services';
import {
  ExaminationCentreDetailsRequestDto,
  SchoolDetailsResponseDto,
  StudentClassDetailsResponseDto,
  StudentResponseDto,
  VigyanKendraDetails,
} from '../../../api/models';
import { StudentEnrollmentFormComponent } from '../student-enrollment-form/student-enrollment-form.component';
import { StateManagerService } from '../../services/state-manager.service';
import dialogConfig from '../../imports/grid-config';
import { LoggedInUserState } from '../../imports/app-state-import';
import { NotificationService } from '../../services/notification.service';
import { LocalStorageService } from '../../services/local-storage.service';
import EnrollmentDefault from '../../interface/enrollment-default';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-student-enrollment-grid',
  standalone: true,
  imports: [
    AgGridModule,
    ApiModule,
    MatIconModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './student-enrollment-grid.component.html',
  styleUrl: './student-enrollment-grid.component.css',
})
export class StudentEnrollmentGridComponent implements OnInit, OnDestroy {
  private readonly enrollmentService = inject(StudentEnrollmentApiService);
  private dialog: MatDialog = inject(MatDialog);
  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);
  private readonly notficationService = inject(NotificationService);
  private readonly examCenterService = inject(
    ExaminationCentreDetailsApiService
  );
  private readonly localStorageService = inject(LocalStorageService);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<StudentResponseDto[]>([]);
  readonly vigyanKendraFilter = signal<undefined | null | number>(undefined);
  readonly schoolFilter = signal<undefined | null | string>(undefined);
  readonly classFilter = signal<undefined | null | string>(undefined);
  readonly examCenterFilter = signal<undefined | null | string>(undefined);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);
  readonly schoolDetailsList = signal<SchoolDetailsResponseDto[]>([]);
  readonly studentClassDetailsList = signal<StudentClassDetailsResponseDto[]>(
    []
  );
  readonly defaultClass = signal<undefined | null | string>(undefined);
  readonly defaultSchool = signal<undefined | null | string>(undefined);
  readonly defaultVigyanKendra = signal<undefined | null | string>(undefined);
  readonly examCenterList = signal<ExaminationCentreDetailsRequestDto[]>([]);
  readonly defaultSchoolList = signal<SchoolDetailsResponseDto[]>([]);

  readonly userLoggedInState = signal<LoggedInUserState | undefined>(undefined);
  readonly filteredItems = computed(() => {
    let filteredData = this.data();
    if (this.vigyanKendraFilter()) {
      filteredData = this.data().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    if (this.schoolFilter()) {
      filteredData = filteredData.filter(
        (i) => i.schoolId === this.schoolFilter()
      );
    }
    if (this.classFilter()) {
      filteredData = filteredData.filter(
        (i) => i.classId === this.classFilter()
      );
    }
    if (this.examCenterFilter()) {
      filteredData = filteredData.filter(
        (i) => i.examinationCentreId === this.examCenterFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData.sort(
      (a, b) => a.name?.localeCompare(b.name ?? '') ?? 0
    );
  });

  readonly filteredExamCenters = computed(() => {
    let filteredData: ExaminationCentreDetailsRequestDto[] = [];
    if (this.vigyanKendraFilter()) {
      filteredData = this.examCenterList().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  readonly filteredSchool = computed(() => {
    let filteredData: SchoolDetailsResponseDto[] = this.schoolDetailsList() ?? [];
    if (this.vigyanKendraFilter()) {
      filteredData = filteredData.filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    if(this.examCenterFilter()) {
      filteredData = filteredData.filter(
        (i) => i.examCentreId === this.examCenterFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  //default enrollment config dropdown form control
  form: any;

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef<StudentResponseDto>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'className', headerName: 'Class', flex: 1 },
    { field: 'roll', headerName: 'Roll', flex: 1 },
    { field: 'number', headerName: 'Number', flex: 1 },
    { field: 'schoolName', headerName: 'School', flex: 1 },
    { field: 'sex', headerName: 'Sex', flex: 1 },
    { field: 'vigyanKendraName', headerName: 'Vigyan Kendra', flex: 1 },
    { field: 'examinationCentreName', headerName: 'Exam Center', flex: 1 },
    {
      headerName: 'Actions',
      width: 140,
      cellRenderer: (params: any) => `
          <button class="btn btn-primary btn-sm btn-edit"><i class="material-icons">edit</i></button>
          <button class="btn btn-danger btn-sm btn-delete"><i class="material-icons">delete</i></button>`,
      onCellClicked: ({ event, data }: any) =>
        this.handleActionClick(event, data),
    },
  ];

  gridApi!: GridReadyEvent['api'];

  constructor(private fb: FormBuilder) {
    effect(
      () => {
        let state = this.globalStateManagerService.globalState();
        if (state && state.vigyanKendras) {
          this.vigyanKendraList.set(state.vigyanKendras);
          this.form
            ?.get('vigyanKendraId')
            .patchValue(
              this.localStorageService.getEnrollmentPreference()?.vigyanKendraId
            );
        }
        if (state && state.schools) {
          this.schoolDetailsList.set(state.schools);
          this.form
            ?.get('schoolId')
            .patchValue(
              this.localStorageService.getEnrollmentPreference()?.schoolId
            );
        }
        if (state && state.classes) {
          this.studentClassDetailsList.set(state.classes);
          this.form
            ?.get('classId')
            .patchValue(
              this.localStorageService.getEnrollmentPreference()?.classId
            );
        }
      },
      { allowSignalWrites: true }
    );
  }
  ngOnDestroy(): void {
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      vigyanKendraId: [''],
      schoolId: [''],
      classId: [''],
    });
    let loginState = this.globalStateManagerService.getLoggedInUserState();
    this.userLoggedInState.set(loginState);
    this.loadConfigData();
    this.loadData();
    //initialize default enrollment config
  }
  initializeDefaultEnrollmentConfig() {
    if (this.localStorageService.getEnrollmentPreference()) {
      var config = this.localStorageService.getEnrollmentPreference();
      this.defaultVigyanKendra.set(config?.vigyanKendraId);
      this.defaultSchoolList.set(
        this.schoolDetailsList().filter(
          (school) => school.vigyanKendraId === config?.vigyanKendraId
        )
      );
      this.defaultClass.set(config?.classId);
      this.defaultSchool.set(config?.schoolId);
      this.form
        ?.get('vigyanKendraId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.vigyanKendraId
        );
      this.form
        ?.get('schoolId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.schoolId
        );
      this.form
        ?.get('classId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.classId
        );
    }
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }

  loadConfigData() {
    this.globalStateManagerService.initializeGlobalState();
    this.getAllExamCenters();
  }

  loadData() {
    this.enrollmentService.getAllStudents().subscribe((response) => {
      this.data.set(
        response.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
      );
      this.initializeDefaultEnrollmentConfig();
    });
  }

  create() {
    this.dialog
      .open(StudentEnrollmentFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: undefined,
          schoolList: [...this.schoolDetailsList()],
          classList: [...this.studentClassDetailsList()],
          vigyanKendraList: [...this.vigyanKendraList()],
          isAdminUser: this.userLoggedInState()?.isAdminUser,
          preference: this.localStorageService.getEnrollmentPreference(),
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: any = {
          name: dto.name,
          studentClassId: dto.class,
          schoolId: dto.school,
          sex: dto.sex,
          vigyanKendraId: dto.vigyanKendraId,
        };
        this.enrollmentService
          .createStudent({ body: request })
          .subscribe((studentResponse) => {
            let studentList = this.data();
            this.data.set([...studentList, studentResponse]);
          });
      });
  }

  edit(item: StudentResponseDto) {
    this.dialog
      .open(StudentEnrollmentFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
          schoolList: [...this.schoolDetailsList()],
          classList: [...this.studentClassDetailsList()],
          vigyanKendraList: [...this.vigyanKendraList()],
          isAdminUser: this.userLoggedInState()?.isAdminUser,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: any = {
          id: item.id,
          name: dto.name,
          studentClassId: dto.class,
          schoolId: dto.school,
          sex: dto.sex,
          vigyanKendraId: dto.vigyanKendraId,
          rollNumber: dto.number,
        };
        this.enrollmentService
          .updateStudent({ body: request })
          .subscribe((studentResponse) => {
            let studentList = this.data();
            studentList = studentList.filter(
              (student) => student.id !== studentResponse.id
            );
            this.data.set([...studentList, studentResponse]);
          });
      });
  }

  delete(item: StudentResponseDto) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.enrollmentService
      .deleteStudent({ id: item.id ?? -1 })
      .subscribe(() => this.loadData());
  }

  // called from the “Actions” renderer
  private handleActionClick(evt: Event, item: StudentResponseDto) {
    if ((evt.target as HTMLElement).closest('.btn-edit'))
      return this.edit(item);
    if ((evt.target as HTMLElement).closest('.btn-delete'))
      return this.delete(item);
  }

  setVigyanKendraFilter(event: any) {
    const value = event.value;
    //reset school filter
    this.schoolFilter.set(undefined);
    this.vigyanKendraFilter.set(value);
  }
  setSchoolFilter(event: any) {
    const value = event.value;
    this.schoolFilter.set(value);
  }

  setClassFilter(event: any) {
    const value = event.value;
    this.classFilter.set(value);
  }

  setExamCenterFilter(event: any) {
    const value = event.value;
    this.examCenterFilter.set(value);
  }

  setDefaultSchool(event: any) {
    this.defaultSchool.set(event.value);
  }

  setDefaultClass(event: any) {
    this.defaultClass.set(event.value);
  }

  setDefaultVigyanKendra(event: any) {
    this.defaultVigyanKendra.set(event.value);
    this.defaultSchoolList.set(
      this.schoolDetailsList().filter(
        (school) => school.vigyanKendraId === event.value
      )
    );
  }

  onRefresh() {
    if (!this.userLoggedInState()?.isAdminUser) {
    }
    this.schoolFilter.set(undefined);
    this.vigyanKendraFilter.set(undefined);
    this.classFilter.set(undefined);
    this.loadData();
  }

  clearFilter() {
    this.schoolFilter.set(undefined);
    this.vigyanKendraFilter.set(undefined);
    this.classFilter.set(undefined);
    this.examCenterFilter.set(undefined);
  }

  getAllExamCenters() {
    this.examCenterService.getAllExamCenters().subscribe((data) => {
      this.examCenterList.set(
        data.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0)
      );
    });
  }

  getByVigyanKendra() {
    this.loadData();
  }

  setDefaultEnrollmentConfig() {
    if (
      !this.defaultClass() ||
      !this.defaultSchool() ||
      !this.defaultVigyanKendra()
    ) {
      this.notficationService.show(
        `Please select vigyankendra, school and class to set deafult.`
      );
    } else {
      let config: EnrollmentDefault = {
        vigyanKendraId: this.defaultVigyanKendra(),
        schoolId: this.defaultSchool(),
        classId: this.defaultClass(),
      };
      this.localStorageService.setEnrollmentPreference(config);
      this.notficationService.show(
        `Default preference has been set, no need to select these in the form.`
      );
    }
  }
}
