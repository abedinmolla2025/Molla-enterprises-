import { useQuery } from "@tanstack/react-query";
import type { InvoiceWithClient, Settings } from "@shared/schema";

interface InvoicePreviewProps {
  invoice: InvoiceWithClient;
  className?: string;
}

export default function InvoicePreview({ invoice, className = "" }: InvoicePreviewProps) {
  const { data: settings = [] } = useQuery<Settings[]>({
    queryKey: ["/api/settings"],
  });

  const getSettingValue = (key: string, defaultValue: string = "") => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || defaultValue;
  };

  const formatCurrency = (amount: string) => {
    const currency = getSettingValue("defaultCurrency", "INR");
    if (currency === "INR") {
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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm ${className}`} id="invoice-preview">
      {/* Header Blue Gradient */}
      <div className="gradient-bg h-3"></div>
      
      <div className="p-8">
        {/* Company Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-lora text-6xl font-black text-blue-800 mb-4 tracking-widest uppercase" data-testid="company-name">
              {companyName}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{companyAddress}</p>
              <p>Phone: {companyPhone} | WhatsApp: {companyWhatsapp}</p>
              <p>Email: {companyEmail}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">TAX INVOICE</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> {formatDate(invoice.date.toString())}</p>
              <p><strong>Due Date:</strong> {formatDate(invoice.dueDate.toString())}</p>
            </div>
          </div>
        </div>
        
        {/* Client Information */}
        <div className="grid grid-cols-2 gap-12 mb-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">INVOICE TO:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-lg">{invoice.client.companyName}</p>
              <p>Attn: {invoice.client.contactPerson}</p>
              <p>{invoice.client.address}</p>
              <p>Phone: {invoice.client.phone}</p>
              <p>Email: {invoice.client.email}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">SHIP TO:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium">Same as billing address</p>
            </div>
          </div>
        </div>
        
        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="px-4 py-4 text-left text-sm font-medium">QTY</th>
                <th className="px-4 py-4 text-left text-sm font-medium">DESCRIPTION</th>
                <th className="px-4 py-4 text-right text-sm font-medium">UNIT PRICE</th>
                <th className="px-4 py-4 text-right text-sm font-medium">TAX</th>
                <th className="px-4 py-4 text-right text-sm font-medium">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="px-4 py-4 text-sm">{item.quantity}</td>
                  <td className="px-4 py-4 text-sm">
                    <div>
                      <p className="font-medium">{item.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-right">{formatCurrency(item.rate)}</td>
                  <td className="px-4 py-4 text-sm text-right">{item.taxRate}%</td>
                  <td className="px-4 py-4 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Thank you message */}
        <div className="text-center mb-8">
          <p className="text-gray-600 italic">Thank you for your business!</p>
        </div>
        
        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {parseFloat(invoice.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Total Tax:</span>
                    <span>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                {parseFloat(invoice.discountAmount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-xl">
                  <span>AMOUNT DUE:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Details Footer */}
        <div className="border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Payment Details:</h4>
              <div className="text-gray-600 space-y-2">
                <div><strong>Bank:</strong> {bankName}</div>
                <div><strong>Account Number:</strong> {accountNumber}</div>
                <div><strong>IFSC Code:</strong> {ifscCode}</div>
                <div><strong>Account Holder:</strong> {accountHolderName}</div>
                <div className="pt-2"><strong>UPI ID:</strong> {upiId}</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Terms & Conditions:</h4>
              <div className="text-gray-600 space-y-1 text-xs">
                <p>• Payment is due within {getSettingValue("defaultDueDays", "30")} days from invoice date</p>
                <p>• Late payment may incur additional charges</p>
                <p>• All work completed as per agreed specifications</p>
                <p>• Please include invoice number with payment</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-4 border-t">
            <p className="text-gray-500 text-sm">
              Due Date: <strong>{formatDate(invoice.dueDate.toString())}</strong>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Blue Gradient */}
      <div className="gradient-bg h-3"></div>
    </div>
  );
}
