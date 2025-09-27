import type { InvoiceWithDetails } from "@shared/schema";

declare global {
  interface Window {
    html2canvas: any;
    jsPDF: any;
  }
}

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails) => {
  if (!window.html2canvas || !window.jsPDF) {
    console.error("PDF libraries not loaded");
    return;
  }

  try {
    const element = document.getElementById('invoice-preview');
    if (!element) {
      console.error("Invoice preview element not found");
      return;
    }

    // Generate canvas from the invoice preview
    const canvas = await window.html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Create PDF
    const { jsPDF } = window.jsPDF;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add image to PDF
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    pdf.save(`${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
