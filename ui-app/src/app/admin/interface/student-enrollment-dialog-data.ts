import {
  SchoolDetailsResponseDto,
  StudentClassDetailsResponseDto,
  StudentResponseDto,
  VigyanKendraDetails,
} from '../../api/models';
import EnrollmentDefault from './enrollment-default';

export default interface StudentEnrollmentDialogData {
  rowData?: StudentResponseDto;
  schoolList: SchoolDetailsResponseDto[];
  classList: StudentClassDetailsResponseDto[];
  vigyanKendraList: VigyanKendraDetails[];
  isAdminUser: boolean;
  preference: EnrollmentDefault;
}
