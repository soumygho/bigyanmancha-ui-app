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
import { StudentEnrollmentApiService } from '../../../api/services';
import {
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

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<StudentResponseDto[]>([]);
  readonly vigyanKendraFilter = signal<undefined | null | number>(undefined);
  readonly schoolFilter = signal<undefined | null | string>(undefined);
  readonly classFilter = signal<undefined | null | string>(undefined);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);
  readonly schoolDetailsList = signal<SchoolDetailsResponseDto[]>([]);
  readonly studentClassDetailsList = signal<StudentClassDetailsResponseDto[]>(
    []
  );
  readonly userLoggedInState = signal<LoggedInUserState | undefined>(undefined);
  readonly filteredItems = computed(() => {
    let filteredData = this.data();
    if (this.vigyanKendraFilter()) {
      filteredData = this.data().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    if (this.schoolFilter()) {
      filteredData = this.data().filter(
        (i) => i.schoolId === this.schoolFilter()
      );
    }
    if (this.classFilter()) {
      filteredData = this.data().filter(
        (i) => i.classId === this.classFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  readonly filteredSchool = computed(() => {
    let filteredData: SchoolDetailsResponseDto[] = [];
    if (this.vigyanKendraFilter()) {
      filteredData = this.schoolDetailsList().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

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

  constructor() {
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
    let loginState = this.globalStateManagerService.getLoggedInUserState();
    this.userLoggedInState.set(loginState);
    this.loadConfigData();
    this.loadData();
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }

  loadConfigData() {
    this.globalStateManagerService.initializeGlobalState();
  }

  loadData() {
    if (this.userLoggedInState()?.isAdminUser) {
      if (this.vigyanKendraFilter()) {
        this.enrollmentService
          .getAllStudentsByVigyanKendraId({ id: this.vigyanKendraFilter()! })
          .subscribe((response) => {
            this.data.set(response);
          });
      } else {
        this.notficationService.show('Please select a vigyan kendra to query.');
      }
    } else {
      this.enrollmentService.getAllStudents().subscribe((response) => {
        this.data.set(response);
      });
    }
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
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        console.trace(dto);
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
    console.trace('Edit clicked!');
    console.trace(item);
    this.dialog
      .open(StudentEnrollmentFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
          schoolList: [...this.schoolDetailsList()],
          classList: [...this.studentClassDetailsList()],
          vigyanKendraList: [...this.vigyanKendraList()],
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

  onRefresh() {
    if (!this.userLoggedInState()?.isAdminUser) {
      this.schoolFilter.set(undefined);
      this.vigyanKendraFilter.set(undefined);
      this.classFilter.set(undefined);
    }
    this.loadData();
  }

  getByVigyanKendra() {
    this.loadData();
  }
}
