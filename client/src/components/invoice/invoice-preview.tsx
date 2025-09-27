import { Building2 } from "lucide-react";

interface PreviewInvoiceItem {
  description: string;
  quantity: string;
  rate: string;
  taxRate?: string;
  discountRate?: string;
  amount: string;
}

interface PreviewClient {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface PreviewTotals {
  subtotal: string;
  totalTax: string;
  totalDiscount: string;
  grandTotal: string;
}

interface InvoicePreviewProps {
  invoice: {
    invoiceNumber: string;
    currency: string;
    invoiceDate: Date;
    dueDate: Date;
    client?: PreviewClient;
    items: PreviewInvoiceItem[];
    totals: PreviewTotals;
  };
}

const getCurrencySymbol = (currency = "INR") => {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || "₹";
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short", 
    year: "numeric",
  });
};

export default function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const currencySymbol = getCurrencySymbol(invoice.currency);

  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden invoice-preview bg-white" 
      id="invoice-preview"
      data-testid="invoice-preview"
    >
      {/* Header with Blue Ocean styling */}
      <div className="blue-ocean-header h-2"></div>
      <div className="p-6 bg-white">
        
        {/* Company Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold font-poppins">
              <span className="blue-ocean-text-primary">MOLLA</span>
              <span className="blue-ocean-text-secondary">ENTERPRISES</span>
            </h1>
            <div className="text-sm text-gray-600 mt-2">
              <p>BAGNAN, HOWRAH, WEST BENGAL 711303</p>
              <p>Phone: 9681766016</p>
              <p>Email: abedinmolla1@gmail.com</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-blue-100 px-3 py-1 rounded mb-2">
              <span className="blue-ocean-text-primary font-semibold text-sm">TAX INVOICE</span>
            </div>
            <p className="text-sm font-medium">{formatDate(invoice.invoiceDate)}</p>
            <p className="text-sm">Invoice # {invoice.invoiceNumber}</p>
            <p className="text-xs text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Client Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-sm text-gray-600 mb-2">INVOICE TO</h3>
            {invoice.client ? (
              <div className="text-sm">
                <p className="font-medium">{invoice.client.name}</p>
                <p>{invoice.client.email}</p>
                <p>{invoice.client.phone}</p>
                <div className="whitespace-pre-line">{invoice.client.address}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                <p>Select a client to display details</p>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-600 mb-2">SHIP TO</h3>
            <div className="text-sm text-gray-500">
              <p>Same as billing address</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full invoice-table">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">QTY</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">DESCRIPTION</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">UNIT PRICE</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">TAX</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-400">
                    Add items to see them here
                  </td>
                </tr>
              ) : (
                invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 text-sm">{parseFloat(item.quantity || "0").toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm">{item.description || "Item description"}</td>
                    <td className="px-3 py-2 text-sm text-right">{currencySymbol}{parseFloat(item.rate || "0").toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-right">
                      {item.taxRate && parseFloat(item.taxRate) > 0 ? `${item.taxRate}%` : "-"}
                    </td>
                    <td className="px-3 py-2 text-sm text-right">{currencySymbol}{parseFloat(item.amount || "0").toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span className="text-sm">Subtotal</span>
              <span className="text-sm">{currencySymbol}{invoice.totals.subtotal}</span>
            </div>
            {parseFloat(invoice.totals.totalDiscount) > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm">Discount</span>
                <span className="text-sm">-{currencySymbol}{invoice.totals.totalDiscount}</span>
              </div>
            )}
            {parseFloat(invoice.totals.totalTax) > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-sm">Total Tax</span>
                <span className="text-sm">{currencySymbol}{invoice.totals.totalTax}</span>
              </div>
            )}
            <div className="border-t border-gray-300 mt-2 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-sm">AMOUNT DUE</span>
                <span className="text-sm">{currencySymbol}{invoice.totals.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You */}
        <div className="text-center text-sm text-gray-600 mb-8">
          Thank you for your business.
        </div>

        {/* Payment Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-sm text-gray-600 mb-3">Payment Details</h3>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p><strong>Bank:</strong> State Bank of India</p>
              <p><strong>Account:</strong> 1234567890</p>
              <p><strong>IFSC:</strong> SBIN0001234</p>
            </div>
            <div>
              <p><strong>UPI ID:</strong> abedinmolla1@paytm</p>
              <p className="text-xs text-gray-500 mt-2">
                Due Date: {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="blue-ocean-header text-white text-center py-2">
        <p className="text-xs">
          MOLLA ENTERPRISES | Phone: 9681766016<br />
          BAGNAN, HOWRAH, WEST BENGAL 711303<br />
          Email: abedinmolla1@gmail.com
        </p>
      </div>
    </div>
  );
}
