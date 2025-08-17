import { Injectable } from '@angular/core';
import { JwtResponse } from '../../api/models';
import {
  ENROLLMENT_DEFAULT_KEY,
  LOCAL_STORAGE_KEY,
} from '../imports/admin-const';
import EnrollmentDefault from '../interface/enrollment-default';

interface LoggedInUserState {
  response: JwtResponse | undefined;
  isLoggedIn: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  setLoggedInUserState(state: string) {
    localStorage.setItem(LOCAL_STORAGE_KEY, state);
  }

  getLoggedInUserState(): string | undefined {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? data : undefined;
  }

  deleteLoggedInUserState() {
    localStorage.clear();
  }

  setEnrollmentPreference(config: EnrollmentDefault) {
    localStorage.setItem(ENROLLMENT_DEFAULT_KEY, JSON.stringify(config));
  }

  getEnrollmentPreference(): EnrollmentDefault | undefined {
    let data = localStorage.getItem(ENROLLMENT_DEFAULT_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return undefined;
  }
}
