import { UserDetailsResponseDto, VigyanKendraDetails } from "../../api/models";

export default interface UserDetailsDialogData {
  rowData?: UserDetailsResponseDto;
  vigyanKendraList: VigyanKendraDetails[];
}
