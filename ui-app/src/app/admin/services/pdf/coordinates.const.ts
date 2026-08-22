import { PdfCoordinates } from "./pdf.model";

export const UNIVERSAL_COORDINATES: PdfCoordinates = {

  page: {
    width: 612,
    height: 792
  },

  header: {

    vigyanKendra: {
      x: 46 + 130,
      y: 710 - 3
    },

    code: {
      x: 490 + 30,
      y: 710 - 3
    },

    examCentre: {
      x: 46 + 130,
      y: 689 - 3
    },

    className: {
      centerX: 306 + 30,
      y: 673 - 3
    }
  },

  candidate: {

    firstRowY: 626,

    rowHeight: 20.9,

    name: {
      x: 67,
      maxWidth: 132
    },

    roll: {
      centerX: 221
    },

    no: {
      centerX: 252
    }
  },

  footer: {

    totalCandidate: {
      centerX: 166,
      y: 87  + 12
    }
  }
};

export const UNIVERSAL_COORDINATES_IX_X: PdfCoordinates = {

  page: {
    width: 612,
    height: 792
  },

  header: {

    vigyanKendra: {
      x: 46 + 130,
      y: 710 - 3
    },

    code: {
      x: 490 + 30,
      y: 710 - 3
    },

    examCentre: {
      x: 46 + 130,
      y: 689 - 3
    },

    className: {
      centerX: 306 + 30,
      y: 673 - 3
    }
  },

  candidate: {

    firstRowY: 626,

    rowHeight: 20.9,

    name: {
      x: 67,
      maxWidth: 132
    },

    roll: {
      centerX: 221 - 25
    },

    no: {
      centerX: 252 - 25
    }
  },

  footer: {

    totalCandidate: {
      centerX: 166,
      y: 87  + 12
    }
  }
};

export type ExamClass =
  | 'I-V'
  | 'VI-VIII'
  | 'IX-X';
