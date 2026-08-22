import { StudentClassDetailsResponseDto, VigyanKendraDetails } from "../../api/models";

export interface DefaultEnrollmentPreferenceDilogueData {
  vigyanKendraList: VigyanKendraDetails[];
  studentClassDetailsList: StudentClassDetailsResponseDto[];
}
