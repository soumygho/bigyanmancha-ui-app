import { SubjectDetailsResponseDto } from './../../api/models/subject-details-response-dto';
import { computed, inject, Injectable, signal } from '@angular/core';
import { SubjectDetailsApiService } from '../../api/services/subject-details-api.service';
import {
  JwtResponse,
  SchoolDetailsResponseDto,
  StudentResponseDto,
  VigyanKendraDetails,
} from '../../api/models';
import {
  SchoolDetailsApiService,
  StudentClassApiService,
  VigyankendraDeatilsApiService,
} from '../../api/services';
import { LocalStorageService } from './local-storage.service';
interface GlobalState {
  subjects: SubjectDetailsResponseDto[] | [];
  classes: StudentResponseDto[] | [];
  vigyanKendras: VigyanKendraDetails[] | [];
  schools: SchoolDetailsResponseDto[] | [];
  initialized: boolean;
}

interface LoggedInUserState {
  response: JwtResponse | undefined,
  isLoggedIn: boolean,
}

@Injectable({
  providedIn: 'root',
})
export class StateManagerService {
  private readonly vigyanKendraService = inject(VigyankendraDeatilsApiService);
  private readonly studentClassApiService = inject(StudentClassApiService);
  private readonly studentSchoolDetailsService = inject(
    SchoolDetailsApiService
  );
  private readonly subjectDetailsService = inject(SubjectDetailsApiService);
  private readonly localStorageService = inject(LocalStorageService);

  private _globalState = signal<GlobalState>({
    subjects: [],
    classes: [],
    vigyanKendras: [],
    schools: [],
    initialized: false,
  });

  private _loggedInUserState = signal<LoggedInUserState>({
    response: undefined,
    isLoggedIn: false
  });

  readonly globalState = computed(() => this._globalState());
  private readonly loggedInUserState = computed(() => this._loggedInUserState());

  public initializeGlobalState() {
    if (!this._globalState().initialized) {
      this.loadConfigData();
    }
  }

  private loadConfigData() {
    let state = this._globalState();
    this.vigyanKendraService.getAllVigyanKendras().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), vigyanKendras: response };
      this._globalState.set(state);
    });
    this.studentClassApiService.getAllClasses().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), classes: response };
      this._globalState.set(state);
    });
    this.studentSchoolDetailsService.getAllSchools().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), schools: response };
      this._globalState.set(state);
    });
    this.subjectDetailsService.getAllSubjects().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), subjects: response, initialized: true};
      this._globalState.set(state);
    });
  }

  mutateLoggedInUserState(jwt: JwtResponse, status: boolean): void {
    var state = {...this._loggedInUserState(), response: jwt, isLoggedIn: status};
    this.localStorageService.setLoggedInUserState(state);
    this._loggedInUserState.set(state);
  }

  getLoggedInUserState() {
    if(!this._loggedInUserState()?.response) {
      let state = this.localStorageService.getLoggedInUserState();
      if(state) {
        this._loggedInUserState.set(state);
      }
    }
    return this._loggedInUserState();
  }

  mutateVigyanKendraData() {
    let state = this._globalState();
    this.vigyanKendraService.getAllVigyanKendras().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), vigyanKendras: response };
      this._globalState.set(state);
    });
  }

  mutateStudentClassData() {
    let state = this._globalState();
    this.studentClassApiService.getAllClasses().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), classes: response };
      this._globalState.set(state);
    });
  }

  mutateSchoolData() {
    let state = this._globalState();
    this.studentSchoolDetailsService.getAllSchools().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), schools: response };
      this._globalState.set(state);
    });
  }

  mutateSubjectData() {
    let state = this._globalState();
    this.subjectDetailsService.getAllSubjects().subscribe((response) => {
      console.trace(response);
      state = { ...this._globalState(), subjects: response, initialized: true};
      this._globalState.set(state);
    });
  }
}
