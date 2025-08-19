declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: any;
    jsPDF?: any;
    pagebreak?: {
      mode?: string | string[];
      before?: string | string[];
      after?: string | string[];
      avoid?: string | string[];
    };
  }

  interface Html2PdfWorker {
    set(options: Html2PdfOptions): Html2PdfWorker;
    from(element: HTMLElement | string): Html2PdfWorker;
    save(filename?: string): Promise<void>;
    to(type: string): Html2PdfWorker;
    output(type: string, options?: any): Promise<any>;
    then(onFulfilled: (value: any) => any, onRejected?: (reason: any) => any): Html2PdfWorker;
  }

  function html2pdf(): Html2PdfWorker;
  
  export default html2pdf;
}