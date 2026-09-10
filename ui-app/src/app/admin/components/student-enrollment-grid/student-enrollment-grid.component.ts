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
  EnrollmentSessionManagementApiService,
  ExaminationCentreDetailsApiService,
  SchoolDetailsApiService,
  StudentEnrollmentApiService,
} from '../../../api/services';
import {
  EnrollmentSession,
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
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DefaultEnrollmentPreferenceComponent } from '../default-enrollment-preference/default-enrollment-preference.component';
import { sortEnrollments } from '../../utility/enrollment-sort-utility';
import exportToExcel from '../../utility/excel-exporter-utility';
import { DrsheetServiceService } from '../../services/pdf/drsheet-service.service';
import { RollNumberAssignmentService } from '../../services/roll-number-Service';

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
    FormsModule,
  ],
  templateUrl: './student-enrollment-grid.component.html',
  styleUrl: './student-enrollment-grid.component.css',
})
export class StudentEnrollmentGridComponent implements OnInit, OnDestroy {
  private readonly enrollmentService = inject(StudentEnrollmentApiService);
  private readonly drSheetService = inject(DrsheetServiceService);
  private dialog: MatDialog = inject(MatDialog);
  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);
  private readonly notficationService = inject(NotificationService);
  private readonly examCenterService = inject(
    ExaminationCentreDetailsApiService,
  );
  private readonly schoolDetailsService = inject(SchoolDetailsApiService);
  private readonly enrollmentSessionService = inject(
    EnrollmentSessionManagementApiService,
  );
  readonly localStorageService = inject(LocalStorageService);
  private readonly rollNumberService = inject(RollNumberAssignmentService);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<StudentResponseDto[]>([]);
  readonly vigyanKendraFilter = signal<undefined | null | number>(undefined);
  readonly schoolFilter = signal<undefined | null | string>(undefined);
  readonly classFilter = signal<undefined | null | string>(undefined);
  readonly examCenterFilter = signal<undefined | null | string>(undefined);
  readonly sexFilter = signal<undefined | null | string>(undefined);
  readonly nameFilter = signal<undefined | null | string>(undefined);
  readonly enrollmentSessionfilter = signal<undefined | null | string>(
    undefined,
  );

  readonly vigyanKendraForFetch = signal<undefined | null | number>(undefined);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);
  readonly schoolDetailsList = signal<SchoolDetailsResponseDto[]>([]);
  readonly studentClassDetailsList = signal<StudentClassDetailsResponseDto[]>(
    [],
  );
  readonly enrollmentSessionList = signal<EnrollmentSession[]>([]);
  readonly defaultClass = signal<undefined | null | string>(undefined);
  readonly defaultSchool = signal<undefined | null | string>(undefined);
  readonly defaultVigyanKendra = signal<undefined | null | string>(undefined);
  readonly examCenterList = signal<ExaminationCentreDetailsRequestDto[]>([]);
  readonly defaultSchoolList = signal<SchoolDetailsResponseDto[]>([]);
  readonly genders = [
    { value: 'M', viewValue: 'Male' },
    { value: 'F', viewValue: 'Female' },
    { value: 'O', viewValue: 'Other' },
  ];
  defaultEnrollmentPreferenceSignal = signal<
    | { className: string; schoolName: string; vigyanKendraName: string }
    | undefined
  >(undefined);

  readonly userLoggedInState = signal<LoggedInUserState | undefined>(undefined);
  readonly filteredItems = computed(() => {
    let filteredData = this.data();
    if (this.vigyanKendraFilter()) {
      filteredData = this.data().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter(),
      );
    }
    if (this.schoolFilter()) {
      filteredData = filteredData.filter(
        (i) => i.schoolId === this.schoolFilter(),
      );
    }
    if (this.classFilter()) {
      filteredData = filteredData.filter(
        (i) => i.classId === this.classFilter(),
      );
    }
    if (this.examCenterFilter()) {
      filteredData = filteredData.filter(
        (i) => i.examinationCentreId === this.examCenterFilter(),
      );
    }
    if (this.sexFilter()) {
      filteredData = filteredData.filter((i) => i.sex === this.sexFilter());
    }
    if (this.nameFilter()) {
      filteredData = filteredData.filter((i) =>
        i.name?.toLowerCase().includes(this.nameFilter()!.toLowerCase()),
      );
    }
    if (this.enrollmentSessionfilter()) {
      filteredData = filteredData.filter(
        (i) => i.enrollmentId === this.enrollmentSessionfilter(),
      );
    }
    filteredData = filteredData ?? [];
    /*return filteredData.sort(
      (a, b) => a.name?.localeCompare(b.name ?? '') ?? 0,
    );*/
    return sortEnrollments(filteredData);
  });

  readonly filteredExamCenters = computed(() => {
    let filteredData: ExaminationCentreDetailsRequestDto[] =
      this.examCenterList() ?? [];
    if (this.vigyanKendraFilter()) {
      filteredData = this.examCenterList().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter(),
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  readonly filteredSchool = computed(() => {
    let filteredData: SchoolDetailsResponseDto[] =
      this.schoolDetailsList() ?? [];
    if (this.vigyanKendraFilter()) {
      filteredData = filteredData.filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter(),
      );
    }
    if (this.examCenterFilter()) {
      filteredData = filteredData.filter(
        (i) => i.examCentreId === this.examCenterFilter(),
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  //default enrollment config dropdown form control
  form: any;

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef<StudentResponseDto>[] = [
    //selection checkbox column
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
      headerName: '',
    },
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
      width: 170,
      cellRenderer: (params: any) => `
          <button class="btn btn-primary btn-sm btn-edit"><i class="material-icons">edit</i></button>
          <button class="btn btn-danger btn-sm btn-delete"><i class="material-icons">delete</i></button>
          <button class="btn btn-info btn-sm btn-promote"><i class="material-icons">account_balance</i></button>`,
      onCellClicked: ({ event, data }: any) =>
        this.handleActionClick(event, data),
    },
  ];

  gridApi!: GridReadyEvent['api'];
  searchText: any;

  constructor(private fb: FormBuilder) {
    effect(
      () => {
        let state = this.globalStateManagerService.globalState();
        if (state && state.vigyanKendras) {
          this.vigyanKendraList.set(state.vigyanKendras);
        }
        if (state && state.schools) {
          this.schoolDetailsList.set(state.schools);
        }
        if (state && state.classes) {
          this.studentClassDetailsList.set(state.classes);
        }
        this.resolveDefaultEnrollmentPreference();
      },
      { allowSignalWrites: true },
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
    this.enrollmentSessionService
      .getAllEnrollmentSession()
      .subscribe((response) => {
        this.enrollmentSessionList.set(response);
      });
    //initialize default enrollment config
  }
  initializeDefaultEnrollmentConfig() {
    if (this.localStorageService.getEnrollmentPreference()) {
      var config = this.localStorageService.getEnrollmentPreference();
      this.defaultVigyanKendra.set(config?.vigyanKendraId);
      this.schoolDetailsService
        .getAllSchoolsByBigyanKendra({
          vigyanKendraId: parseInt(config?.vigyanKendraId ?? '0'),
        })
        .subscribe((response) => {
          this.defaultSchoolList.set(response);
        });
      this.defaultClass.set(config?.classId);
      this.defaultSchool.set(config?.schoolId);
      this.form
        ?.get('vigyanKendraId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.vigyanKendraId,
        );
      this.form
        ?.get('schoolId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.schoolId,
        );
      this.form
        ?.get('classId')
        .patchValue(
          this.localStorageService.getEnrollmentPreference()?.classId,
        );
      this.resolveDefaultEnrollmentPreference();
    } else {
      this.defaultEnrollmentPreferenceSignal.set(undefined);
    }
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }

  loadConfigData() {
    this.globalStateManagerService.initializeGlobalState();
  }

  loadData() {
    if (!this.userLoggedInState()?.isAdminUser) {
      this.enrollmentService.getAllStudents().subscribe((response) => {
        this.data.set(
          response.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0),
        );
      });
    } else {
      if (this.vigyanKendraForFetch()) {
        this.getEnrollmentsByVigyanKendra(this.vigyanKendraForFetch()!);
      }
    }
    this.initializeDefaultEnrollmentConfig();
  }

  getEnrollmentsByVigyanKendra(vigyanKendraId: number) {
    this.enrollmentService
      .getAllStudentsByVigyanKendraId({ id: vigyanKendraId })
      .subscribe((response) => {
        this.data.set(
          response.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0),
        );
      });
  }
  //assign roll numbers to all students in a vigyan kendra
  assignRollNumbersByVigyanKendra(vigyanKendraId: number) {
    this.rollNumberService
      .assignRollNumbers(vigyanKendraId)
      .subscribe((response) => {
        this.notficationService.show(
          `Roll number assignment status: ${response.message ?? 'No message returned from server'}`,
        );
      });
  }
  //get roll number assignment status
  getRollNumberAssignmentStatusByVigyanKendra(vigyanKendraId: number) {
    this.rollNumberService
      .getAssignmentStatus(vigyanKendraId)
      .subscribe((response) => {
        this.notficationService.show(
          `Roll number assignment status: ${response.message ?? 'No message returned from server'}`,
        );
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

  openDefaultEnrollmentPreferenceDialog() {
    this.dialog
      .open(DefaultEnrollmentPreferenceComponent, {
        ...this.dialogConfig,
        data: {
          vigyanKendraList: [...this.vigyanKendraList()],
          studentClassDetailsList: [...this.studentClassDetailsList()],
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.initializeDefaultEnrollmentConfig();
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
              (student) => student.id !== studentResponse.id,
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
    if ((evt.target as HTMLElement).closest('.btn-promote'))
      return this.promote([item]);
  }

  promote(item: StudentResponseDto[]) {
    if (!confirm(`Promote ${item.length} students to next session?`)) return;
    let studentIds = item.map((i) => i.id ?? -1);
    this.enrollmentService.promoteStudentsToNextSession({ body: studentIds }).subscribe((response) => {
      this.notficationService.show(
        `${response.length} students promoted to next session.`,
      );
      this.loadData();
    });
  }

  setVigyanKendraFilter(event: any) {
    const value = event.value;
    //reset school filter
    this.schoolFilter.set(undefined);
    this.examCenterFilter.set(undefined);
    this.vigyanKendraFilter.set(value);
    //populate the schools data based on the selected vigyan kendra
    this.schoolDetailsService
      .getAllSchoolsByBigyanKendra({ vigyanKendraId: value })
      .subscribe((response) => {
        this.schoolDetailsList.set(response);
      });
    this.examCenterService
      .getAllExamCentersByVigyanKendraId({ vigyanKendraId: value })
      .subscribe((response) => {
        this.examCenterList.set(response);
      });
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

  setSexFilter(event: any) {
    const value = event.value;
    this.sexFilter.set(value);
  }

  setEnrollmentSessionFilter(event: any) {
    const value = event.value;
    this.enrollmentSessionfilter.set(value);
  }

  setDefaultSchool(event: any) {
    this.defaultSchool.set(event.value);
  }

  setDefaultClass(event: any) {
    this.defaultClass.set(event.value);
  }

  setDefaultVigyanKendra(event: any) {
    this.defaultVigyanKendra.set(event.value);
    this.schoolDetailsService
      .getAllSchoolsByBigyanKendra({ vigyanKendraId: event.value })
      .subscribe((response) => {
        this.defaultSchoolList.set(response);
      });
  }

  setVigyanKendraForFetching(event: any) {
    const value = event.value;
    this.vigyanKendraForFetch.set(value);
    this.getByVigyanKendra();
    this.setVigyanKendraFilter({ value: value });
  }

  onRefresh() {
    if (!this.userLoggedInState()?.isAdminUser) {
      this.loadData();
    } else {
      this.getByVigyanKendra();
    }
    this.clearFilter();
  }

  clearFilter() {
    this.schoolFilter.set(undefined);
    this.vigyanKendraFilter.set(undefined);
    this.classFilter.set(undefined);
    this.examCenterFilter.set(undefined);
    this.sexFilter.set(undefined);
    this.enrollmentSessionfilter.set(undefined);
    this.nameFilter.set(undefined);
  }

  getAllExamCenters() {
    this.examCenterService.getAllExamCenters().subscribe((data) => {
      this.examCenterList.set(
        data.sort((a, b) => a.name?.localeCompare(b.name ?? '') ?? 0),
      );
    });
  }

  getByVigyanKendra() {
    if (this.vigyanKendraForFetch()) {
      this.getEnrollmentsByVigyanKendra(this.vigyanKendraForFetch()!);
    } else {
      this.notficationService.show(`Please select a vigyankendra.`);
    }
  }

  assignRollNumber() {
    if (this.vigyanKendraForFetch()) {
      this.assignRollNumbersByVigyanKendra(this.vigyanKendraForFetch()!);
    } else {
      this.notficationService.show(`Please select a vigyankendra.`);
    }
  }

  getRollNumberAssignmentStatus() {
    if (this.vigyanKendraForFetch()) {
      this.getRollNumberAssignmentStatusByVigyanKendra(this.vigyanKendraForFetch()!);
    } else {
      this.notficationService.show(`Please select a vigyankendra.`);
    }
  }

  setDefaultEnrollmentConfig() {
    if (
      !this.defaultClass() ||
      !this.defaultSchool() ||
      !this.defaultVigyanKendra()
    ) {
      this.notficationService.show(
        `Please select vigyankendra, school and class to set deafult.`,
      );
    } else {
      let config: EnrollmentDefault = {
        vigyanKendraId: this.defaultVigyanKendra(),
        schoolId: this.defaultSchool(),
        classId: this.defaultClass(),
      };
      this.localStorageService.setEnrollmentPreference(config);
      this.notficationService.show(
        `Default preference has been set, no need to select these in the form.`,
      );
    }
  }

  setNameFilter() {
    const value = this.searchText;
    if (!value || value.trim() === '') {
      this.nameFilter.set(undefined);
      return;
    }
    this.nameFilter.set(value);
  }

  resolveDefaultEnrollmentPreference() {
    let config = this.localStorageService.getEnrollmentPreference();
    if (!config) return undefined;
    //resolve school name, class name and vigyan kendra name from the ids
    let className = this.studentClassDetailsList().find(
      (c) => c.id === parseInt(config?.classId ?? '0'),
    )?.name;
    let vigyanKendraName = this.vigyanKendraList().find(
      (v) => v.id === parseInt(config?.vigyanKendraId ?? '0'),
    )?.name;
    let schoolName = undefined;

    if (config?.vigyanKendraId && config?.schoolId) {
      this.schoolDetailsService
        .getAllSchoolsByBigyanKendra({
          vigyanKendraId: parseInt(config?.vigyanKendraId ?? '0'),
        })
        .subscribe((schools) => {
          schoolName = schools.find(
            (s) => s.id === parseInt(config?.schoolId ?? '0'),
          )?.name;
          console.log(
            `Resolved default enrollment preference: ${vigyanKendraName} - ${className} - ${schoolName}`,
          );
          this.defaultEnrollmentPreferenceSignal.set({
            className: className ?? '',
            schoolName: schoolName ?? '',
            vigyanKendraName: vigyanKendraName ?? '',
          });
        });
    } else {
      this.defaultEnrollmentPreferenceSignal.set({
        className: className ?? '',
        schoolName: schoolName ?? '',
        vigyanKendraName: vigyanKendraName ?? '',
      });
    }
  }

  downloadReport() {
    let filteredData = this.filteredItems()
      .map((item) => ({
        Name: item.name,
        Class: item.className,
        Roll: item.roll,
        Number: item.number,
        School: item.schoolName,
        Sex: item.sex,
        ExaminationCentre: item.examinationCentreName,
        EnrollmentYear: item.enrollmentYear,
      }));
    let sheetName = 'Enrollments-' + this.vigyanKendraForFetch();
    let filename = 'Enrollment-Report-' + this.vigyanKendraForFetch() + '.xlsx';
    if (!this.userLoggedInState()?.isAdminUser) {
      sheetName = 'Enrollments-' + this.userLoggedInState()?.vigyanKendraCode;
      filename = 'Enrollment-Report-' + this.userLoggedInState()?.vigyanKendraCode + '.xlsx';
    }
    return exportToExcel(filteredData, filename, sheetName);
  }

  downloadDrSheet() {
    if (this.userLoggedInState()?.isAdminUser) {
      if (!this.vigyanKendraForFetch()) {
        this.notficationService.show(`Please select a vigyankendra to download DR Sheet.`);
        return;
      }
      const classId = this.classFilter() ? Number.parseInt(this.classFilter()!) : undefined;
      const examCenterId = this.examCenterFilter() ? Number.parseInt(this.examCenterFilter()!) : undefined;;
      this.enrollmentService.getDrSheetData({ body: { vigyanKendraId: this.vigyanKendraForFetch()!, examCenterId: examCenterId, classId: classId } }).subscribe((response) => {
        if (response && response.length > 0) {
          //need to create pdf based on class and exam center
          this.drSheetService.generatePdf(response).then(() => {
            this.notficationService.show(`DR Sheet data fetched. Please check download folder for details.`);
          });
        } else {
          this.notficationService.show(`No data found for DR Sheet.`);
        }
      });
    }
  }

  promoteSelectedStudents() {
    const selectedRows = this.gridApi.getSelectedRows();
    const studentIds = selectedRows.map(selectedRow => selectedRow.id).filter(id => id !== undefined);
    this.promote(selectedRows);
  }
}
