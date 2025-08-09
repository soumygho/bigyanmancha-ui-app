import { computed, inject, Injectable, signal } from '@angular/core';
import { SubjectDetailsApiService } from '../../api/services/subject-details-api.service';
import { JwtResponse } from '../../api/models';
import {
  SchoolDetailsApiService,
  StudentClassApiService,
  VigyankendraDeatilsApiService,
} from '../../api/services';
import { LocalStorageService } from './local-storage.service';
import { jwtDecode } from 'jwt-decode';
import {
  GlobalState,
  JWTClaims,
  LoggedInUserState,
} from '../imports/app-state-import';
import { JwtHelperService } from './jwt-helper.service';
import { LoadingSpinnerService } from './loading-spinner.service';
import { delay, finalize } from 'rxjs';
import { NotificationService } from './notification.service';
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
  private readonly jwtHelperService = inject(JwtHelperService);
  private readonly loadingSpinnerService = inject(LoadingSpinnerService);
  private readonly notificationService = inject(NotificationService);

  private _globalState = signal<GlobalState>({
    subjects: [],
    classes: [],
    vigyanKendras: [],
    schools: [],
    initialized: false,
  });

  private _loggedInUserState = signal<LoggedInUserState>({
    isLoggedIn: false,
    roles: [],
    id: '',
    username: '',
    isAdminUser: false,
    isVigyanKendraUser: false,
    isSchoolUser: false,
    vigyanKendraId: '',
    vigyanKendraName: '',
    vigyanKendraCode: '',
  });

  readonly globalState = computed(() => this._globalState());
  private readonly loggedInUserState = computed(() =>
    this._loggedInUserState()
  );

  public initializeGlobalState() {
    if (!this._globalState().initialized) {
      this.loadConfigData();
    }
  }

  public destroyGlobalState() {
    this._globalState.set({ ...this._globalState(), initialized: false });
  }

  private loadConfigData() {
    let state = this._globalState();
    this.vigyanKendraService
      .getAllVigyanKendras()
      .subscribe({
        next: (response) => {
          console.trace(response);
          state = { ...this._globalState(), vigyanKendras: response };
          this._globalState.set(state);
        },
        error: (err) => {
          console.error(err);
          this.notificationService.show(
            'Error while getting vigyan kendras information from server.'
          );
        },
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
      state = { ...this._globalState(), subjects: response, initialized: true };
      this._globalState.set(state);
    });
  }

  mutateLoggedInUserState(jwt: JwtResponse, status: boolean): void {
    var claims = jwtDecode<JWTClaims>(jwt?.jwt!);
    console.trace(claims);
    var state = {
      ...this._loggedInUserState(),
      isLoggedIn: status,
    };
    state = { ...state, ...claims };
    this.localStorageService.setLoggedInUserState(jwt?.jwt!);
    this._loggedInUserState.set(state);
  }

  getLoggedInUserState(): LoggedInUserState {
    let state = this.localStorageService.getLoggedInUserState();
    console.trace(state);
    if (state && !this.jwtHelperService.isTokenExpired(state)) {
      let claims = jwtDecode<JWTClaims>(state);
      console.trace(claims);
      this._loggedInUserState.set({
        ...this._loggedInUserState(),
        ...claims,
        isLoggedIn: true,
      });
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
      state = { ...this._globalState(), subjects: response, initialized: true };
      this._globalState.set(state);
    });
  }
}
