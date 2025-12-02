import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
      pageNumber: number;
      pageCount: number;
      cursor: { x: number; y: number };
    };
  }
}

export {};
