import {
  SchoolDetailsResponseDto,
  StudentClassDetailsResponseDto,
  StudentResponseDto,
  VigyanKendraDetails,
} from '../../api/models';

export default interface StudentEnrollmentDialogData {
  rowData?: StudentResponseDto;
  schoolList: SchoolDetailsResponseDto[];
  classList: StudentClassDetailsResponseDto[];
  vigyanKendraList: VigyanKendraDetails[];
}
