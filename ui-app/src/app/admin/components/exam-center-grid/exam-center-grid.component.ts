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
  SchoolDetailsResponseDto,
  VigyanKendraDetails,
} from '../../../api/models';
import { StateManagerService } from '../../services/state-manager.service';
import { ExamCenterFormComponent } from '../exam-center-form/exam-center-form.component';
import dialogConfig from '../../imports/grid-config';
import { ExamCenterDetailsDialogComponent } from '../exam-center-details-dialog/exam-center-details-dialog.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-exam-center-grid',
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
  templateUrl: './exam-center-grid.component.html',
  styleUrl: './exam-center-grid.component.css',
})
export class ExamCenterGridComponent {
  private readonly schoolDetailsService = inject(SchoolDetailsApiService);
  private readonly examCenterDetailsService = inject(
    ExaminationCentreDetailsApiService
  );
  private dialog: MatDialog = inject(MatDialog);

  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<ExaminationCentreDetailsRequestDto[]>([]);
  readonly schoolList = signal<SchoolDetailsResponseDto[]>([]);
  readonly vigyanKendraFilter = signal<undefined | null | number>(undefined);
  readonly schoolFilter = signal<undefined | null | string>(undefined);
  readonly vigyanKendraList = signal<VigyanKendraDetails[]>([]);

  readonly filteredItems = computed(() => {
    let filteredData = [];
    if (this.vigyanKendraFilter() && this.schoolFilter()) {
      filteredData = this.data()
        .filter((i) => i.vigyanKendraId === this.vigyanKendraFilter())
        .filter((i) => i.schoolDetailsId === this.schoolFilter());
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
      filteredData = this.schoolList().filter(
        (i) => i.vigyanKendraId === this.vigyanKendraFilter()
      );
    }
    filteredData = filteredData ?? [];
    return filteredData;
  });

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef<ExaminationCentreDetailsRequestDto>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'vigyanKendraName',
      headerName: 'Vigyan Kendra',
      flex: 1,
    },
    {
      field: 'schoolName',
      headerName: 'School',
      flex: 1,
    },
    {
      headerName: 'Actions',
      width: 180,
      cellRenderer: (params: any) => `
          <button class="btn btn-primary btn-sm btn-edit"><i class="material-icons">edit</i></button>
          <button class="btn btn-info btn-sm btn-details"><i class="material-icons">info</i></button>
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
          this.schoolList.set(state.schools);
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
    this.examCenterDetailsService.getAllExamCenters().subscribe((response) => {
      console.trace(response);
      this.data.set(response);
    });
  }

  create() {
    this.dialog
      .open(ExamCenterFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: undefined,
          vigyanKendraList: [...this.vigyanKendraList()],
          schoolList: [...this.schoolList()],
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        console.trace(dto);
        if (!dto) return;
        let request: any = {
          name: dto.name,
          vigyanKendraId: dto.vigyanKendraId,
          schoolDetailsId: dto.schoolDetailsId,
        };
        this.examCenterDetailsService
          .createExamCenter({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateSchoolData();
            this.loadData();
          });
      });
  }

  edit(item: ExaminationCentreDetailsRequestDto) {
    console.trace('Edit clicked!');
    console.trace(item);
    this.dialog
      .open(ExamCenterFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
          vigyanKendraList: [...this.vigyanKendraList()],
          schoolList: [...this.schoolList()],
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: any = {
          id: item.id,
          name: dto.name,
          vigyanKendraId: dto.vigyanKendraId,
          schoolDetailsId: dto.schoolDetailsId,
        };
        this.examCenterDetailsService
          .updateExamCenter({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateSchoolData();
            this.loadData();
          });
      });
  }

  delete(item: ExaminationCentreDetailsRequestDto) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.schoolDetailsService
      .deleteSchool({ id: item.id ?? -1 })
      .subscribe(() => {
        this.globalStateManagerService.mutateSchoolData();
        this.loadData();
      });
  }

  // called from the “Actions” renderer
  private handleActionClick(
    evt: Event,
    item: ExaminationCentreDetailsRequestDto
  ) {
    if ((evt.target as HTMLElement).closest('.btn-edit'))
      return this.edit(item);
    if ((evt.target as HTMLElement).closest('.btn-delete'))
      return this.delete(item);
    if ((evt.target as HTMLElement).closest('.btn-details'))
      return this.handleInfoClick(item);
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

  handleInfoClick(item: ExaminationCentreDetailsRequestDto) {
    this.dialog.open(ExamCenterDetailsDialogComponent, {
      ...this.dialogConfig,
      data: {
        rowData: item,
      },
    });
  }
}
