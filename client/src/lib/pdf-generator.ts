import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { InvoiceWithClient } from '@shared/schema';

declare global {
  interface Window {
    html2canvas: typeof html2canvas;
    jsPDF: typeof jsPDF;
  }
}

export async function generatePDF(invoice: InvoiceWithClient): Promise<void> {
  // Create a temporary container for the invoice
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '210mm'; // A4 width
  tempContainer.style.backgroundColor = 'white';
  tempContainer.style.fontFamily = 'Inter, sans-serif';
  document.body.appendChild(tempContainer);

  try {
    // Fetch settings for company details
    const settingsResponse = await fetch('/api/settings');
    const settings = settingsResponse.ok ? await settingsResponse.json() : [];
    
    const getSettingValue = (key: string, defaultValue: string = "") => {
      const setting = settings.find((s: any) => s.key === key);
      return setting?.value || defaultValue;
    };

    const formatCurrency = (amount: string) => {
      const currency = invoice.currency || 'INR';
      if (currency === 'INR') {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(parseFloat(amount));
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const companyName = getSettingValue("companyName", "MOLLA ENTERPRISES");
    const companyEmail = getSettingValue("companyEmail", "abedinmolla1@gmail.com");
    const companyPhone = getSettingValue("companyPhone", "9681766016");
    const companyWhatsapp = getSettingValue("companyWhatsapp", "9681766016");
    const companyAddress = getSettingValue("companyAddress", "BAGNAN, HOWRAH, WEST BENGAL 711303");

    const bankName = getSettingValue("bankName", "State Bank of India");
    const accountNumber = getSettingValue("accountNumber", "1234567890");
    const ifscCode = getSettingValue("ifscCode", "SBIN0001234");
    const accountHolderName = getSettingValue("accountHolderName", "MOLLA ENTERPRISES");
    const upiId = getSettingValue("upiId", "abedinmolla1@paytm");
    const defaultDueDays = getSettingValue("defaultDueDays", "30");

    // Create the invoice HTML
    tempContainer.innerHTML = `
      <div style="background: white; width: 100%; min-height: 297mm; padding: 0; margin: 0; font-family: Inter, sans-serif;">
        <!-- Header Blue Gradient -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); height: 12px;"></div>
        
        <div style="padding: 32px;">
          <!-- Company Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
            <div>
              <h1 style="font-family: Lora, serif; font-size: 36px; font-weight: bold; color: #1e40af; margin: 0 0 12px 0; line-height: 1.2;">
                ${companyName}
              </h1>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                <p style="margin: 2px 0;">${companyAddress}</p>
                <p style="margin: 2px 0;">Phone: ${companyPhone} | WhatsApp: ${companyWhatsapp}</p>
                <p style="margin: 2px 0;">Email: ${companyEmail}</p>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 28px; font-weight: bold; color: #374151; margin: 0 0 12px 0;">TAX INVOICE</h2>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                <p style="margin: 2px 0;"><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                <p style="margin: 2px 0;"><strong>Date:</strong> ${formatDate(invoice.date.toString())}</p>
                <p style="margin: 2px 0;"><strong>Due Date:</strong> ${formatDate(invoice.dueDate.toString())}</p>
              </div>
            </div>
          </div>
          
          <!-- Client Information -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 32px;">
            <div>
              <h3 style="font-weight: 600; color: #374151; margin: 0 0 12px 0; font-size: 16px;">INVOICE TO:</h3>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                <p style="font-weight: 500; font-size: 16px; color: #1f2937; margin: 2px 0;">${invoice.client.companyName}</p>
                <p style="margin: 2px 0;">Attn: ${invoice.client.contactPerson}</p>
                <p style="margin: 2px 0;">${invoice.client.address}</p>
                <p style="margin: 2px 0;">Phone: ${invoice.client.phone}</p>
                <p style="margin: 2px 0;">Email: ${invoice.client.email}</p>
              </div>
            </div>
            <div>
              <h3 style="font-weight: 600; color: #374151; margin: 0 0 12px 0; font-size: 16px;">SHIP TO:</h3>
              <div style="font-size: 12px; color: #6b7280; line-height: 1.5;">
                <p style="font-weight: 500; margin: 2px 0;">Same as billing address</p>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <div style="margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #1e40af; color: white;">
                  <th style="padding: 16px; text-align: left; font-size: 12px; font-weight: 500;">QTY</th>
                  <th style="padding: 16px; text-align: left; font-size: 12px; font-weight: 500;">DESCRIPTION</th>
                  <th style="padding: 16px; text-align: right; font-size: 12px; font-weight: 500;">UNIT PRICE</th>
                  <th style="padding: 16px; text-align: right; font-size: 12px; font-weight: 500;">TAX</th>
                  <th style="padding: 16px; text-align: right; font-size: 12px; font-weight: 500;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 16px; font-size: 12px;">${item.quantity}</td>
                    <td style="padding: 16px; font-size: 12px;">
                      <div>
                        <p style="font-weight: 500; margin: 0;">${item.description}</p>
                      </div>
                    </td>
                    <td style="padding: 16px; font-size: 12px; text-align: right;">${formatCurrency(item.rate)}</td>
                    <td style="padding: 16px; font-size: 12px; text-align: right;">${item.taxRate}%</td>
                    <td style="padding: 16px; font-size: 12px; text-align: right; font-weight: 500;">${formatCurrency(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Thank you message -->
          <div style="text-align: center; margin-bottom: 32px;">
            <p style="color: #6b7280; font-style: italic; margin: 0;">Thank you for your business!</p>
          </div>
          
          <!-- Totals -->
          <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
            <div style="width: 320px;">
              <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px;">
                <div style="font-size: 12px; line-height: 1.5;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(invoice.subtotal)}</span>
                  </div>
                  ${parseFloat(invoice.taxAmount) > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                      <span>Total Tax:</span>
                      <span>${formatCurrency(invoice.taxAmount)}</span>
                    </div>
                  ` : ''}
                  ${parseFloat(invoice.discountAmount) > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #dc2626;">
                      <span>Discount:</span>
                      <span>-${formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  ` : ''}
                  <div style="border-top: 1px solid #d1d5db; padding-top: 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                    <span>AMOUNT DUE:</span>
                    <span>${formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Payment Details Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 32px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; font-size: 12px;">
              <div>
                <h4 style="font-weight: 600; color: #374151; margin: 0 0 12px 0;">Payment Details:</h4>
                <div style="color: #6b7280; line-height: 1.5;">
                  <div style="margin-bottom: 8px;"><strong>Bank:</strong> ${bankName}</div>
                  <div style="margin-bottom: 8px;"><strong>Account Number:</strong> ${accountNumber}</div>
                  <div style="margin-bottom: 8px;"><strong>IFSC Code:</strong> ${ifscCode}</div>
                  <div style="margin-bottom: 8px;"><strong>Account Holder:</strong> ${accountHolderName}</div>
                  <div style="margin-bottom: 8px; padding-top: 8px;"><strong>UPI ID:</strong> ${upiId}</div>
                </div>
              </div>
              <div>
                <h4 style="font-weight: 600; color: #374151; margin: 0 0 12px 0;">Terms & Conditions:</h4>
                <div style="color: #6b7280; font-size: 10px; line-height: 1.4;">
                  <p style="margin: 4px 0;">• Payment is due within ${defaultDueDays} days from invoice date</p>
                  <p style="margin: 4px 0;">• Late payment may incur additional charges</p>
                  <p style="margin: 4px 0;">• All work completed as per agreed specifications</p>
                  <p style="margin: 4px 0;">• Please include invoice number with payment</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Due Date: <strong>${formatDate(invoice.dueDate.toString())}</strong>
              </p>
            </div>
          </div>
        </div>
        
        <!-- Footer Blue Gradient -->
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); height: 12px;"></div>
      </div>
    `;

    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight,
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Download the PDF
    pdf.save(`${invoice.invoiceNumber}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
}
