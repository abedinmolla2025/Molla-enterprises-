import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import type { InvoiceWithDetails } from "@shared/schema";

declare global {
  interface Window {
    html2canvas: any;
    jsPDF: any;
  }
}

interface PDFGeneratorProps {
  invoice: InvoiceWithDetails;
  elementId?: string;
  fileName?: string;
  children?: React.ReactNode;
}

export default function PDFGenerator({ 
  invoice, 
  elementId = "invoice-preview", 
  fileName,
  children 
}: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (!window.html2canvas || !window.jsPDF) {
      console.error("PDF libraries not loaded. Make sure html2canvas and jsPDF are included.");
      return;
    }

    setIsGenerating(true);

    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with ID '${elementId}' not found`);
        return;
      }

      // Generate canvas from the invoice preview with high quality
      const canvas = await window.html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false, // Disable logging in production
        allowTaint: false,
        foreignObjectRendering: true,
      });

      // Create PDF with proper dimensions
      const { jsPDF } = window.jsPDF;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Calculate dimensions to fit A4 page
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm  
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0), 
        'PNG', 
        0, 
        position, 
        imgWidth, 
        imgHeight,
        undefined,
        'FAST'
      );
      
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0), 
          'PNG', 
          0, 
          position, 
          imgWidth, 
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= pageHeight;
      }

      // Generate filename
      const pdfFileName = fileName || `${invoice.invoiceNumber || 'invoice'}.pdf`;
      
      // Download the PDF
      pdf.save(pdfFileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // If children provided, render them with click handler
  if (children) {
    return (
      <div onClick={generatePDF} className="cursor-pointer">
        {children}
      </div>
    );
  }

  // Default button rendering
  return (
    <Button 
      onClick={generatePDF}
      disabled={isGenerating}
      variant="secondary"
      data-testid="button-generate-pdf"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
}
