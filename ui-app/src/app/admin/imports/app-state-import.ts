import { ExaminationCentreDetailsRequestDto, SchoolDetailsResponseDto, StudentResponseDto, SubjectDetailsResponseDto, VigyanKendraDetails } from "../../api/models";

export interface GlobalState {
  subjects: SubjectDetailsResponseDto[] | [];
  classes: StudentResponseDto[] | [];
  vigyanKendras: VigyanKendraDetails[] | [];
  schools: SchoolDetailsResponseDto[] | [];
  examcenters: ExaminationCentreDetailsRequestDto[] | [];
  initialized: boolean;
}

export interface LoggedInUserState {
  roles: string[];
  id: string;
  username: string;
  isAdminUser: boolean;
  isVigyanKendraUser: boolean;
  isSchoolUser: boolean;
  vigyanKendraId: string;
  vigyanKendraName: string;
  vigyanKendraCode: string;
  isLoggedIn: boolean;
}

export interface JWTClaims {
  roles: string[];
  id: string;
  username: string;
  isAdminUser: boolean;
  isVigyanKendraUser: boolean;
  isSchoolUser: boolean;
  vigyanKendraId: string;
  vigyanKendraName: string;
  vigyanKendraCode: string;
}
