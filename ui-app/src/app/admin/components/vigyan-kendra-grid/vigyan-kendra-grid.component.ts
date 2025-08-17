import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import {
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
} from 'ag-grid-community';
import { ApiModule } from '../../../api/api.module';
import { VigyankendraDeatilsApiService } from '../../../api/services';
import {
  StudentClassDetailsResponseDto,
  StudentClassRequestDto,
  SubjectDetailsResponseDto,
  VigyanKendraDetails,
  VigyanKendraDetailsRequestDto,
} from '../../../api/models';
import { MatDialog } from '@angular/material/dialog';
import { StudentClassFormComponent } from '../student-class-form/student-class-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StateManagerService } from '../../services/state-manager.service';
import { VigyanKendraFormComponent } from '../vigyan-kendra-form/vigyan-kendra-form.component';
import dialogConfig from '../../imports/grid-config';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-vigyan-kendra-grid',
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
  templateUrl: './vigyan-kendra-grid.component.html',
  styleUrl: './vigyan-kendra-grid.component.css',
})
export class VigyanKendraGridComponent implements OnInit, OnDestroy {
  private readonly vigyankendraDetailsService = inject(
    VigyankendraDeatilsApiService
  );
  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);
  private dialog: MatDialog = inject(MatDialog);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<VigyanKendraDetails[]>([]);

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'code', headerName: 'Code', flex: 1 },
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

  gridApi!: any;

  constructor() {}

  ngOnInit(): void {
    this.loadConfigData();
    this.loadData();
  }

  onGridReady(e: GridReadyEvent) {
    this.gridApi = e.api;
  }

  ngOnDestroy(): void {
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  loadConfigData() {
    this.globalStateManagerService.initializeGlobalState();
  }

  loadData() {
    this.vigyankendraDetailsService
      .getAllVigyanKendras()
      .subscribe((response) => {
        this.data.set(response);
      });
  }

  create() {
    this.dialog
      .open(VigyanKendraFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: undefined,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: VigyanKendraDetailsRequestDto = {
          name: dto.name,
          code: dto.code,
        };
        this.vigyankendraDetailsService
          .createVigyanKendraDetails({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateVigyanKendraData();
            this.loadData();
          });
      });
  }

  edit(item: VigyanKendraDetailsRequestDto) {
    this.dialog
      .open(VigyanKendraFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: VigyanKendraDetailsRequestDto = {
          id: item.id,
          name: dto.name,
          code: dto.code,
        };
        this.vigyankendraDetailsService
          .updateVigyanKendraDetails({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateVigyanKendraData();
            this.loadData();
          });
      });
  }

  delete(item: StudentClassDetailsResponseDto) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.vigyankendraDetailsService
      .deleteVigyanKendraById({ id: item.id ?? -1 })
      .subscribe(() => {
        this.globalStateManagerService.mutateVigyanKendraData();
        this.loadData();
      });
  }

  // called from the “Actions” renderer
  private handleActionClick(evt: Event, item: StudentClassDetailsResponseDto) {
    if ((evt.target as HTMLElement).closest('.btn-edit'))
      return this.edit(item);
    if ((evt.target as HTMLElement).closest('.btn-delete'))
      return this.delete(item);
  }

  onRefresh() {
    this.loadData();
  }
}
