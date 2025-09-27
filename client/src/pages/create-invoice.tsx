import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Download, Plus, Trash2 } from "lucide-react";
import InvoicePreview from "@/components/invoice/invoice-preview";
import { downloadInvoicePDF } from "@/lib/pdf-utils";
import type { Client, InvoiceWithDetails } from "@shared/schema";

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientId: z.string().min(1, "Client selection is required"),
  currency: z.string().default("INR"),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
  invoiceDate: z.string(),
  dueDate: z.string(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    rate: z.number().min(0, "Rate must be 0 or greater"),
    taxRate: z.number().min(0).max(100).optional(),
    discountRate: z.number().min(0).max(100).optional(),
  })).min(1, "At least one item is required"),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  taxRate?: number;
  discountRate?: number;
  amount: number;
}

const calculateItemAmount = (quantity: number, rate: number, taxRate = 0, discountRate = 0) => {
  const subtotal = quantity * rate;
  const discountAmount = subtotal * (discountRate / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = taxRate > 0 ? afterDiscount * (taxRate / 100) : 0;
  return afterDiscount + taxAmount;
};

const calculateTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalDiscount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.rate;
    return sum + (itemSubtotal * ((item.discountRate || 0) / 100));
  }, 0);
  const totalTax = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.rate;
    const afterDiscount = itemSubtotal - (itemSubtotal * ((item.discountRate || 0) / 100));
    return sum + (item.taxRate && item.taxRate > 0 ? afterDiscount * (item.taxRate / 100) : 0);
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  return {
    subtotal: subtotal.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    totalTax: totalTax.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
  };
};

const getCurrencySymbol = (currency = "INR") => {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || "₹";
};

export default function CreateInvoice() {
  const [location] = useLocation();
  const { toast } = useToast();
  const editId = new URLSearchParams(location.split("?")[1] || "").get("edit");

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: nextInvoiceNumber } = useQuery<{ nextNumber: string }>({
    queryKey: ["/api/invoices/next-number"],
    enabled: !editId,
  });

  const { data: editingInvoice } = useQuery<InvoiceWithDetails>({
    queryKey: ["/api/invoices", editId],
    enabled: !!editId,
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      clientId: "",
      currency: "INR",
      status: "draft",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: [{ description: "", quantity: 1, rate: 0, taxRate: 0, discountRate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Set invoice number when available
  useEffect(() => {
    if (nextInvoiceNumber && !editId) {
      form.setValue("invoiceNumber", nextInvoiceNumber.nextNumber);
    }
  }, [nextInvoiceNumber, editId, form]);

  // Populate form when editing
  useEffect(() => {
    if (editingInvoice) {
      form.reset({
        invoiceNumber: editingInvoice.invoiceNumber,
        clientId: editingInvoice.clientId,
        currency: editingInvoice.currency,
        status: editingInvoice.status as any,
        invoiceDate: new Date(editingInvoice.invoiceDate).toISOString().split("T")[0],
        dueDate: new Date(editingInvoice.dueDate).toISOString().split("T")[0],
        items: editingInvoice.items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          taxRate: item.taxRate ? parseFloat(item.taxRate) : 0,
          discountRate: item.discountRate ? parseFloat(item.discountRate) : 0,
        })),
      });
    }
  }, [editingInvoice, form]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      // Reset form
      form.reset();
      if (nextInvoiceNumber) {
        form.setValue("invoiceNumber", nextInvoiceNumber.nextNumber);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/invoices/${editId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    const selectedClient = clients?.find(c => c.id === data.clientId);
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a valid client",
        variant: "destructive",
      });
      return;
    }

    const items = data.items.map(item => ({
      description: item.description,
      quantity: item.quantity.toString(),
      rate: item.rate.toString(),
      taxRate: (item.taxRate || 0).toString(),
      discountRate: (item.discountRate || 0).toString(),
      amount: calculateItemAmount(item.quantity, item.rate, item.taxRate, item.discountRate).toString(),
    }));

    const totals = calculateTotals(data.items.map(item => ({
      ...item,
      amount: calculateItemAmount(item.quantity, item.rate, item.taxRate, item.discountRate),
    })));

    const invoiceData = {
      invoiceNumber: data.invoiceNumber,
      clientId: data.clientId,
      currency: data.currency,
      status: data.status,
      invoiceDate: new Date(data.invoiceDate).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount,
      grandTotal: totals.grandTotal,
      items,
    };

    if (editId) {
      updateMutation.mutate(invoiceData);
    } else {
      createMutation.mutate(invoiceData);
    }
  };

  const handleDownloadPDF = () => {
    const formData = form.getValues();
    const selectedClient = clients?.find(c => c.id === formData.clientId);
    
    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client before downloading PDF",
        variant: "destructive",
      });
      return;
    }

    const items = formData.items.map(item => ({
      id: "",
      invoiceId: "",
      description: item.description,
      quantity: item.quantity.toString(),
      rate: item.rate.toString(),
      taxRate: (item.taxRate || 0).toString(),
      discountRate: (item.discountRate || 0).toString(),
      amount: calculateItemAmount(item.quantity, item.rate, item.taxRate, item.discountRate).toString(),
      createdAt: new Date(),
    }));

    const totals = calculateTotals(formData.items.map(item => ({
      ...item,
      amount: calculateItemAmount(item.quantity, item.rate, item.taxRate, item.discountRate),
    })));

    const mockInvoice: InvoiceWithDetails = {
      id: "",
      invoiceNumber: formData.invoiceNumber,
      clientId: formData.clientId,
      currency: formData.currency,
      status: formData.status,
      invoiceDate: new Date(formData.invoiceDate),
      dueDate: new Date(formData.dueDate),
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount,
      grandTotal: totals.grandTotal,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: selectedClient,
      items,
    };

    downloadInvoicePDF(mockInvoice);
  };

  const watchedValues = form.watch();
  const selectedClient = clients?.find(c => c.id === watchedValues.clientId);

  return (
    <div className="p-8" data-testid="create-invoice-page">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {editId ? "Edit Invoice" : "Create New Invoice"}
        </h2>
        <p className="text-muted-foreground">
          Generate professional invoices for your clients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Invoice Form */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Invoice Details</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    {...form.register("invoiceNumber")}
                    data-testid="input-invoice-number"
                  />
                  {form.formState.errors.invoiceNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.invoiceNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    {...form.register("invoiceDate")}
                    data-testid="input-invoice-date"
                  />
                  {form.formState.errors.invoiceDate && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.invoiceDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...form.register("dueDate")}
                    data-testid="input-due-date"
                  />
                  {form.formState.errors.dueDate && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.dueDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={watchedValues.currency}
                    onValueChange={(value) => form.setValue("currency", value)}
                  >
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Client Selection */}
              <div>
                <Label htmlFor="clientId">Select Client</Label>
                <Select
                  value={watchedValues.clientId}
                  onValueChange={(value) => form.setValue("clientId", value)}
                >
                  <SelectTrigger data-testid="select-client">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.clientId && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.clientId.message}
                  </p>
                )}
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Invoice Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: "", quantity: 1, rate: 0, taxRate: 0, discountRate: 0 })}
                    data-testid="button-add-item"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-input rounded-md p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                          {...form.register(`items.${index}.description`)}
                          placeholder="Item description"
                          className="text-sm"
                          data-testid={`input-item-description-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          placeholder="Qty"
                          className="text-sm"
                          data-testid={`input-item-quantity-${index}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.rate`, { valueAsNumber: true })}
                          placeholder="0.00"
                          className="text-sm"
                          data-testid={`input-item-rate-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Tax % (Optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.taxRate`, { valueAsNumber: true })}
                          placeholder="0"
                          className="text-sm"
                          data-testid={`input-item-tax-${index}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Discount %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.discountRate`, { valueAsNumber: true })}
                          placeholder="0"
                          className="text-sm"
                          data-testid={`input-item-discount-${index}`}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm font-medium">
                        Amount: {getCurrencySymbol(watchedValues.currency)}
                        {calculateItemAmount(
                          watchedValues.items[index]?.quantity || 0,
                          watchedValues.items[index]?.rate || 0,
                          watchedValues.items[index]?.taxRate || 0,
                          watchedValues.items[index]?.discountRate || 0
                        ).toFixed(2)}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-remove-item-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Invoice Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watchedValues.status}
                  onValueChange={(value) => form.setValue("status", value as any)}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-invoice"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editId ? "Update Invoice" : "Save Invoice"}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={handleDownloadPDF}
                  data-testid="button-download-pdf"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Live Invoice Preview */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Live Preview</h3>
            <InvoicePreview
              invoice={{
                invoiceNumber: watchedValues.invoiceNumber,
                currency: watchedValues.currency,
                invoiceDate: new Date(watchedValues.invoiceDate || new Date()),
                dueDate: new Date(watchedValues.dueDate || new Date()),
                client: selectedClient,
                items: watchedValues.items.map(item => ({
                  description: item.description,
                  quantity: item.quantity?.toString() || "0",
                  rate: item.rate?.toString() || "0",
                  taxRate: (item.taxRate || 0).toString(),
                  discountRate: (item.discountRate || 0).toString(),
                  amount: calculateItemAmount(
                    item.quantity || 0,
                    item.rate || 0,
                    item.taxRate || 0,
                    item.discountRate || 0
                  ).toString(),
                })),
                totals: calculateTotals(watchedValues.items.map(item => ({
                  ...item,
                  quantity: item.quantity || 0,
                  rate: item.rate || 0,
                  taxRate: item.taxRate || 0,
                  discountRate: item.discountRate || 0,
                  amount: calculateItemAmount(
                    item.quantity || 0,
                    item.rate || 0,
                    item.taxRate || 0,
                    item.discountRate || 0
                  ),
                }))),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
