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
  SchoolDetailsApiService,
} from '../../../api/services';
import {
  ExaminationCentreDetailsRequestDto,
  SchoolDetailsRequestDto,
  SchoolDetailsResponseDto,
  StudentResponseDto,
  VigyanKendraDetails,
} from '../../../api/models';
import { StateManagerService } from '../../services/state-manager.service';
import { SchoolDetailsFormComponent } from '../school-details-form/school-details-form.component';
import dialogConfig from '../../imports/grid-config';
import { AssignSchoolDialogComponent } from '../assign-school-dialog/assign-school-dialog.component';
import { assignSchool } from '../../../api/fn/examination-centre-details-api/assign-school';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-school-details-grid',
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
  templateUrl: './school-details-grid.component.html',
  styleUrl: './school-details-grid.component.css',
})
export class SchoolDetailsGridComponent implements OnInit, OnDestroy {
  private readonly schoolDetailsService = inject(SchoolDetailsApiService);
  private readonly examCenterDetailsService = inject(
    ExaminationCentreDetailsApiService
  );
  private dialog: MatDialog = inject(MatDialog);

  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<SchoolDetailsResponseDto[]>([]);
  readonly vigyanKendraFilter = signal<undefined | null | number>(undefined);
  readonly schoolFilter = signal<undefined | null | string>(undefined);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);
  readonly examCenterList = signal<ExaminationCentreDetailsRequestDto[]>([]);

  readonly filteredItems = computed(() => {
    let filteredData = [];
    if (this.vigyanKendraFilter() && this.schoolFilter()) {
      filteredData = this.data()
        .filter((i) => i.vigyanKendraId === this.vigyanKendraFilter())
        .filter((i) => i.id === this.schoolFilter());
    } else if (this.vigyanKendraFilter()) {
      filteredData = this.data().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    } else if (this.schoolFilter()) {
      filteredData = this.data().filter((i) => i.id === this.schoolFilter());
    } else {
      filteredData = this.data();
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  readonly filteredSchoolList = computed(() => {
    let filteredData: SchoolDetailsResponseDto[] = [];
    if (this.vigyanKendraFilter()) {
      filteredData = this.data().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef<SchoolDetailsRequestDto>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'vigyanKendraName', headerName: 'Vigyan Kendra', flex: 1 },
    { field: 'examCentreName', headerName: 'Exam Center', flex: 1 },
    {
      headerName: 'Actions',
      width: 350,
      cellRenderer: (params: any) => `
          <button class="btn btn-primary btn-sm btn-exam-center-assign">Assign center</button>
          <button class="btn btn-danger btn-sm btn-exam-center-deassign">Remove center</button>
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
        console.trace(state);
        if (state && state.vigyanKendras) {
          this.vigyanKendraList.set(state.vigyanKendras);
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
    this.loadConfigData();
    this.loadData();
  }

  onGridReady(e: GridReadyEvent) {
    console.trace('grid is ready!');
    this.gridApi = e.api;
  }

  loadConfigData() {
    this.globalStateManagerService.initializeGlobalState();
  }

  loadData() {
    this.schoolDetailsService.getAllSchools().subscribe((response) => {
      console.trace(response);
      this.data.set(response);
    });
    this.examCenterDetailsService.getAllExamCenters().subscribe((response) => {
      this.examCenterList.set(response);
    });
  }

  create() {
    this.dialog
      .open(SchoolDetailsFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: undefined,
          vigyanKendraList: [...this.vigyanKendraList()],
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        console.trace(dto);
        if (!dto) return;
        let request: any = {
          name: dto.name,
          vigyanKendraId: dto.vigyanKendraId,
        };
        this.schoolDetailsService
          .createSchool({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateSchoolData();
            this.loadData();
          });
      });
  }

  edit(item: SchoolDetailsResponseDto) {
    console.trace('Edit clicked!');
    console.trace(item);
    this.dialog
      .open(SchoolDetailsFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
          vigyanKendraList: [...this.vigyanKendraList()],
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: any = {
          id: item.id,
          name: dto.name,
          vigyanKendraId: dto.vigyanKendraId,
        };
        this.schoolDetailsService
          .updateSchool({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateSchoolData();
            this.loadData();
          });
      });
  }

  delete(item: SchoolDetailsResponseDto) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.schoolDetailsService
      .deleteSchool({ id: item.id ?? -1 })
      .subscribe(() => {
        this.globalStateManagerService.mutateSchoolData();
        this.loadData();
      });
  }

  // called from the “Actions” renderer
  private handleActionClick(evt: Event, item: StudentResponseDto) {
    if ((evt.target as HTMLElement).closest('.btn-edit'))
      return this.edit(item);
    if ((evt.target as HTMLElement).closest('.btn-delete'))
      return this.delete(item);
    if ((evt.target as HTMLElement).closest('.btn-exam-center-assign'))
      return this.handleAssignExamCenter(item);
    if ((evt.target as HTMLElement).closest('.btn-exam-center-deassign'))
      return this.handleDeAssignExamCenter(item);
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

  onRefresh() {
    this.schoolFilter.set(undefined);
    this.vigyanKendraFilter.set(undefined);
    this.loadData();
  }

  private handleAssignExamCenter(item: SchoolDetailsResponseDto): void {
    this.dialog
      .open(AssignSchoolDialogComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
          vigyanKendraList: [...this.vigyanKendraList()],
          examCenterList: this.getExamCentersByVigyanKendra(
            item.vigyanKendraId!
          ),
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        console.trace(dto);
        if (!dto) return;
        let request: any = {
          schoolIds: [item.id],
          examinationCentreId: dto.examCenterId,
        };
        this.examCenterDetailsService
          .assignSchool({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateSchoolData();
            this.loadData();
          });
      });
  }
  private handleDeAssignExamCenter(item: SchoolDetailsResponseDto): void {}

  private getExamCentersByVigyanKendra(
    id: number
  ): ExaminationCentreDetailsRequestDto[] {
    return this.examCenterList().filter((i) => i.vigyanKendraId === id);
  }
}
