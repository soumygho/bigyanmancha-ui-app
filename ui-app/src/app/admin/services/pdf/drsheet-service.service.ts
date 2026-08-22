import { Injectable } from '@angular/core';
import { ExamClass, UNIVERSAL_COORDINATES, UNIVERSAL_COORDINATES_IX_X } from './coordinates.const';
import { DrSheetResponse, StudentDetails } from '../../../api/models';
import {
  PDFDocument,
  PDFPage,
  PDFFont,
  StandardFonts
} from 'pdf-lib';

@Injectable({
  providedIn: 'root'
})
export class DrsheetServiceService {
  private readonly MAX_RECORDS_PER_PAGE = 25;
  constructor() { }

  private getTemplatePath(
    className: string
  ): string {
    var examClass: ExamClass;
    if (className === 'I' || className === 'II' || className === 'III' || className === 'IV' || className === 'V') {
      examClass = 'I-V';
    } else if (className === 'VI' || className === 'VII' || className === 'VIII') {
      examClass = 'VI-VIII';
    } else if (className === 'IX' || className === 'X') {
      examClass = 'IX-X';
    } else {
      throw new Error(
        `Unsupported class name: ${className}`
      );
    }

    switch (examClass) {

      case 'I-V':
        return 'assets/pdf/dr-sheet-I-V.pdf';

      case 'VI-VIII':
        return 'assets/pdf/dr-sheet-VI-VIII.pdf';

      case 'IX-X':
        return 'assets/pdf/dr-sheet-IX-X.pdf';

      default:
        throw new Error(
          `Unsupported exam class: ${examClass}`
        );
    }
  }

  async generatePdf(
    data: DrSheetResponse[]
  ): Promise<void> {
    data.forEach(async drSheet => {
      const templatePath =
        this.getTemplatePath(
          drSheet.className || ''
        );

      const templateBytes =
        await fetch(templatePath)
          .then(response =>
            response.arrayBuffer()
          );

      const templatePdf =
        await PDFDocument.load(
          templateBytes
        );

      const outputPdf =
        await PDFDocument.create();

      const font =
        await outputPdf.embedFont(
          StandardFonts.Helvetica
        );

      const pages =
        this.chunkCandidates(
          drSheet.students ?? [],
          this.MAX_RECORDS_PER_PAGE
        );

      for (
        let pageIndex = 0;
        pageIndex < pages.length;
        pageIndex++
      ) {

        const [templatePage] =
          await outputPdf.copyPages(
            templatePdf,
            [0]
          );

        outputPdf.addPage(
          templatePage
        );

        const page =
          outputPdf.getPage(
            pageIndex
          );

        this.fillHeader(
          page,
          drSheet,
          font
        );
        const isIXX =
          drSheet.className === 'IX' ||
          drSheet.className === 'X';
        this.fillCandidates(
          page,
          pages[pageIndex],
          font,
          isIXX
        );

        this.fillFooter(
          page,
          pages[pageIndex].length,
          font
        );
      }

      const bytes =
        await outputPdf.save();

      this.downloadPdf(
        bytes,
        `${drSheet.examCenterName}-DR-Sheet.pdf`
      );
    });

  }

  private fillCandidates(
    page: PDFPage,
    candidates: StudentDetails[],
    font: PDFFont,
    isIXX: boolean = false
  ): void {

    const c =
      isIXX ? UNIVERSAL_COORDINATES_IX_X.candidate : UNIVERSAL_COORDINATES.candidate;

    candidates.forEach(
      (candidate, index) => {

        const y =
          c.firstRowY -
          index * c.rowHeight;

        // Name
        this.drawTextFit(
          page,
          candidate.name!,
          c.name.x,
          y,
          c.name.maxWidth,
          8,
          font
        );

        // Roll
        this.drawCenteredText(
          page,
          candidate.roll!,
          c.roll.centerX,
          y,
          7.5,
          font
        );

        // No.
        this.drawCenteredText(
          page,
          candidate.no!,
          c.no.centerX,
          y,
          7.5,
          font
        );
      }
    );
  }

  // =========================================================
  // HEADER
  // =========================================================

  private fillHeader(
    page: PDFPage,
    data: DrSheetResponse,
    font: PDFFont,
  ): void {

    /*
     * Name of Vigyan Kendra
     *
     * Template position:
     * approximately x = 46
     * y = 710
     */

    this.drawText(
      page,
      data.vigyanKendraName!,
      UNIVERSAL_COORDINATES.header.vigyanKendra.x,
      UNIVERSAL_COORDINATES.header.vigyanKendra.y,
      9,
      font
    );

    /*
     * Code
     */

    this.drawText(
      page,
      data.vigyanKendraCode!,
      UNIVERSAL_COORDINATES.header.code.x,
      UNIVERSAL_COORDINATES.header.code.y,
      9,
      font
    );

    /*
     * Name of Exam Centre
     */

    this.drawText(
      page,
      data.examCenterName!,
      UNIVERSAL_COORDINATES.header.examCentre.x,
      UNIVERSAL_COORDINATES.header.examCentre.y,
      9,
      font
    );

    /*
     * Class
     *
     * The template has "Class –" in the centre
     * above the candidate table.
     */

    if (data.className) {

      this.drawCenteredText(
        page,
        data.className,
        UNIVERSAL_COORDINATES.header.className.centerX,
        UNIVERSAL_COORDINATES.header.className.y,
        9,
        font
      );
    }
  }
  // =========================================================
  // FOOTER
  // =========================================================

  private fillFooter(
    page: PDFPage,
    candidateCount: number,
    font: PDFFont
  ): void {

    /*
     * Total Candidate in Class
     *
     * Blank box is around x = 148-183
     * and y = 80-94.
     */

    this.drawCenteredText(
      page,
      String(candidateCount),
      UNIVERSAL_COORDINATES.footer.totalCandidate.centerX,
      UNIVERSAL_COORDINATES.footer.totalCandidate.y,
      8,
      font
    );
  }

  // =========================================================
  // TEXT HELPERS
  // =========================================================

  private drawText(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    size: number,
    font: PDFFont
  ): void {

    if (!text) {
      return;
    }

    page.drawText(
      String(text),
      {
        x,
        y,
        size,
        font
      }
    );
  }

  private drawCenteredText(
    page: PDFPage,
    text: string,
    centerX: number,
    y: number,
    size: number,
    font: PDFFont
  ): void {

    if (!text) {
      return;
    }

    const width =
      font.widthOfTextAtSize(
        String(text),
        size
      );

    page.drawText(
      String(text),
      {
        x: centerX - (width / 2),
        y,
        size,
        font
      }
    );
  }

  /*
   * Draw text inside a fixed width.
   *
   * If the candidate name is long,
   * the font size is reduced automatically.
   */

  private drawTextFit(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    initialSize: number,
    font: PDFFont
  ): void {

    if (!text) {
      return;
    }

    let fontSize = initialSize;

    while (
      fontSize > 5 &&
      font.widthOfTextAtSize(
        text,
        fontSize
      ) > maxWidth
    ) {
      fontSize -= 0.5;
    }

    page.drawText(
      text,
      {
        x,
        y,
        size: fontSize,
        font
      }
    );
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  private chunkCandidates(
    candidates: StudentDetails[],
    size: number
  ): StudentDetails[][] {

    const result: StudentDetails[][] = [];

    for (
      let i = 0;
      i < candidates.length;
      i += size
    ) {

      result.push(
        candidates.slice(
          i,
          i + size
        )
      );
    }

    return result;
  }
  // =========================================================
  // DOWNLOAD
  // =========================================================

  private downloadPdf(
    bytes: any,
    fileName: string
  ): void {

    const blob =
      new Blob([bytes as BlobPart], { type: 'application/pdf' });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // =========================================================
  // VALIDATION
  // =========================================================

  private validateData(
    data: DrSheetResponse
  ): void {

    if (!data) {
      throw new Error(
        'Dr sheet data is required'
      );
    }

    if (
      !data.students ||
      data.students.length === 0
    ) {
      throw new Error(
        'No candidates found'
      );
    }
  }

  // =========================================================
  // FILE NAME
  // =========================================================

  private safeFileName(
    value: string
  ): string {

    return (value || 'exam-centre')
      .replace(
        /[^a-zA-Z0-9-_ ]/g,
        ''
      )
      .trim()
      .replace(
        /\s+/g,
        '-'
      );
  }


}
