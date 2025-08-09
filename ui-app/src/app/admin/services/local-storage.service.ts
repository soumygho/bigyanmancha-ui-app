import { Injectable } from '@angular/core';
import { JwtResponse } from '../../api/models';
import { LOCAL_STORAGE_KEY } from '../imports/admin-const';

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
}
