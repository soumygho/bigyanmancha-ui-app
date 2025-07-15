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
import { StudentClassApiService } from '../../../api/services';
import {
  StudentClassDetailsResponseDto,
  StudentClassRequestDto,
  SubjectDetailsResponseDto,
} from '../../../api/models';
import { MatDialog } from '@angular/material/dialog';
import { StudentClassFormComponent } from '../student-class-form/student-class-form.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StateManagerService } from '../../services/state-manager.service';
import dialogConfig from '../../imports/grid-config';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-student-class-grid',
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
  templateUrl: './student-class-grid.component.html',
  styleUrl: './student-class-grid.component.css',
})
export class StudentClassGridComponent implements OnInit, OnDestroy {
  private readonly studentClassDetailsService = inject(StudentClassApiService);
  private readonly globalStateManagerService: StateManagerService =
    inject(StateManagerService);
  private dialog: MatDialog = inject(MatDialog);

  private readonly dialogConfig = dialogConfig;
  //local state
  readonly data = signal<StudentClassDetailsResponseDto[]>([]);
  readonly subjectList = signal<SubjectDetailsResponseDto[]>([]);

  // ─── AG Grid setup ─────────────────────────────────────────────────────────
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 1 },
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

  constructor() {
    effect(
      () => {
        this.subjectList.set(
          this.globalStateManagerService.globalState().subjects
        );
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.loadConfigData();
    this.loadData();
  }

  onGridReady(e: GridReadyEvent) {
    console.trace('grid is ready!');
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
    this.studentClassDetailsService.getAllClasses().subscribe((response) => {
      console.trace(response);
      this.data.set(response);
    });
  }

  create() {
    this.dialog
      .open(StudentClassFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: undefined,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        console.trace(dto);
        if (!dto) return;
        let request: StudentClassRequestDto = {
          name: dto.name,
        };
        this.studentClassDetailsService
          .createClass({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateStudentClassData();
            this.loadData();
          });
      });
  }

  edit(item: StudentClassDetailsResponseDto) {
    console.trace('Edit clicked!');
    console.trace(item);
    this.dialog
      .open(StudentClassFormComponent, {
        ...this.dialogConfig,
        data: {
          rowData: item,
        },
      })
      .afterClosed()
      .subscribe((dto) => {
        if (!dto) return;
        let request: StudentClassRequestDto = {
          id: item.id,
          name: dto.name,
        };
        console.trace(request);
        this.studentClassDetailsService
          .updateClass({ body: request })
          .subscribe(() => {
            this.globalStateManagerService.mutateStudentClassData();
            this.loadData();
          });
      });
  }

  delete(item: StudentClassDetailsResponseDto) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.studentClassDetailsService
      .deleteClass({ id: item.id ?? -1 })
      .subscribe(() => this.loadData());
  }

  // called from the “Actions” renderer
  private handleActionClick(evt: Event, item: StudentClassDetailsResponseDto) {
    if ((evt.target as HTMLElement).closest('.btn-edit'))
      return this.edit(item);
    if ((evt.target as HTMLElement).closest('.btn-delete'))
      return this.delete(item);
  }
}
