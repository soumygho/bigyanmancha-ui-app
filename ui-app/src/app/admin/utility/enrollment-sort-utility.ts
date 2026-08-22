//Sort the enrollments StudentResponseDto[] based on the Class first in the ascending order and then
//class should be sorted based on weighted way like {'I' = 1, 'II' = 2, 'III' = 3, 'IV' = 4, 'V' = 5, 'VI' = 6, 'VII' = 7, 'VIII' = 8, 'IX' = 9, 'X' = 10, 'XI' = 11, 'XII' = 12}
import { StudentResponseDto } from '../../api/models';

// based on the School name in the ascending order and then based on the Student name in the ascending order
const classOrder = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
};
export function sortEnrollments(
  enrollments: StudentResponseDto[],
): StudentResponseDto[] {
  return enrollments.sort((a, b) => {
    if (
      a &&
      b &&
      a.className &&
      b.className &&
      a.schoolName &&
      b.schoolName &&
      a.name &&
      b.name
    ) {
      // Sort by class in ascending order
      const classA = classOrder[a.className as keyof typeof classOrder] || 0;
      const classB = classOrder[b.className as keyof typeof classOrder] || 0;
      if (classA !== classB) {
        return classA - classB;
      }
      // If classes are the same, sort by school name
      if (a.schoolName !== b.schoolName) {
        return a.schoolName.localeCompare(b.schoolName);
      }
      // If school names are the same, sort by student name
      return a.name.localeCompare(b.name);
    }
    return 0; // If any of the properties are missing, consider them equal
  });
}
