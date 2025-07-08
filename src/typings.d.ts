// Declaraciones de tipos para bibliotecas externas
declare module 'jspdf' {
  export class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string | number[]);
    addImage(imageData: string | HTMLImageElement | HTMLCanvasElement, format: string, x: number, y: number, width: number, height: number): void;
    addPage(): void;
    save(filename: string): void;
  }
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string;
    width?: number;
    height?: number;
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

// Declaraciones globales cuando se cargan desde scripts
declare const jsPDF: any;
declare const html2canvas: any;
