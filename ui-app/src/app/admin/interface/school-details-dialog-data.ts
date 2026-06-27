import {
  ExaminationCentreDetailsRequestDto,
  SchoolDetailsResponseDto,
  VigyanKendraDetails,
} from '../../api/models';

export default interface SchoolDetailsDialogData {
  rowData?: SchoolDetailsResponseDto;
  vigyanKendraList: VigyanKendraDetails[];
  examCenterList: ExaminationCentreDetailsRequestDto[];
}
