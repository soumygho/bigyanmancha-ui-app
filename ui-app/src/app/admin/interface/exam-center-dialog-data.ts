import {
  ExaminationCentreDetailsRequestDto,
  SchoolDetailsResponseDto,
  VigyanKendraDetails,
} from '../../api/models';

export default interface ExamCenterDialogData {
  rowData?: ExaminationCentreDetailsRequestDto;
  vigyanKendraList: VigyanKendraDetails[];
  schoolList: SchoolDetailsResponseDto[];
}
