export interface PdfCoordinates {

  page: {
    width: number;
    height: number;
  };

  header: {
    vigyanKendra: {
      x: number;
      y: number;
    };

    code: {
      x: number;
      y: number;
    };

    examCentre: {
      x: number;
      y: number;
    };

    className: {
      centerX: number;
      y: number;
    };
  };

  candidate: {
    firstRowY: number;
    rowHeight: number;

    name: {
      x: number;
      maxWidth: number;
    };

    roll: {
      centerX: number;
    };

    no: {
      centerX: number;
    };
  };

  footer: {
    totalCandidate: {
      centerX: number;
      y: number;
    };
  };
}
