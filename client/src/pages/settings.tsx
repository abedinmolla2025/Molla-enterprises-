import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Building2, 
  FileText 
} from "lucide-react";
import type { Setting } from "@shared/schema";

const currencySchema = z.object({
  defaultCurrency: z.string().min(1, "Default currency is required"),
});

const paymentSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  upiId: z.string().min(1, "UPI ID is required"),
});

const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email is required"),
});

const invoiceSettingsSchema = z.object({
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  defaultTaxRate: z.number().min(0).max(100),
  dueDays: z.number().min(1, "Due days must be at least 1"),
});

type CurrencyFormData = z.infer<typeof currencySchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;
type CompanyFormData = z.infer<typeof companySchema>;
type InvoiceSettingsFormData = z.infer<typeof invoiceSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const currencyForm = useForm<CurrencyFormData>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      defaultCurrency: "INR",
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
    },
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "MOLLA ENTERPRISES",
      address: "BAGNAN, HOWRAH, WEST BENGAL 711303",
      phone: "9681766016",
      email: "abedinmolla1@gmail.com",
    },
  });

  const invoiceSettingsForm = useForm<InvoiceSettingsFormData>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      invoicePrefix: "INV-",
      defaultTaxRate: 18,
      dueDays: 30,
    },
  });

  // Load settings into forms
  useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      // Currency settings
      if (settingsMap.defaultCurrency) {
        currencyForm.setValue("defaultCurrency", settingsMap.defaultCurrency);
      }

      // Payment settings
      if (settingsMap.bankName) paymentForm.setValue("bankName", settingsMap.bankName);
      if (settingsMap.accountNumber) paymentForm.setValue("accountNumber", settingsMap.accountNumber);
      if (settingsMap.ifscCode) paymentForm.setValue("ifscCode", settingsMap.ifscCode);
      if (settingsMap.upiId) paymentForm.setValue("upiId", settingsMap.upiId);

      // Company settings
      if (settingsMap.companyName) companyForm.setValue("companyName", settingsMap.companyName);
      if (settingsMap.address) companyForm.setValue("address", settingsMap.address);
      if (settingsMap.phone) companyForm.setValue("phone", settingsMap.phone);
      if (settingsMap.email) companyForm.setValue("email", settingsMap.email);

      // Invoice settings
      if (settingsMap.invoicePrefix) invoiceSettingsForm.setValue("invoicePrefix", settingsMap.invoicePrefix);
      if (settingsMap.defaultTaxRate) invoiceSettingsForm.setValue("defaultTaxRate", parseFloat(settingsMap.defaultTaxRate));
      if (settingsMap.dueDays) invoiceSettingsForm.setValue("dueDays", parseInt(settingsMap.dueDays));
    }
  }, [settings, currencyForm, paymentForm, companyForm, invoiceSettingsForm]);

  const saveSettingMutation = useMutation({
    mutationFn: async (setting: { key: string; value: string }) => {
      const response = await apiRequest("POST", "/api/settings", setting);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const onCurrencySubmit = (data: CurrencyFormData) => {
    saveSettingMutation.mutate({
      key: "defaultCurrency",
      value: data.defaultCurrency,
    });
  };

  const onPaymentSubmit = (data: PaymentFormData) => {
    Promise.all([
      saveSettingMutation.mutateAsync({ key: "bankName", value: data.bankName }),
      saveSettingMutation.mutateAsync({ key: "accountNumber", value: data.accountNumber }),
      saveSettingMutation.mutateAsync({ key: "ifscCode", value: data.ifscCode }),
      saveSettingMutation.mutateAsync({ key: "upiId", value: data.upiId }),
    ]).then(() => {
      toast({
        title: "Success",
        description: "Payment details saved successfully",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to save payment details",
        variant: "destructive",
      });
    });
  };

  const onCompanySubmit = (data: CompanyFormData) => {
    Promise.all([
      saveSettingMutation.mutateAsync({ key: "companyName", value: data.companyName }),
      saveSettingMutation.mutateAsync({ key: "address", value: data.address }),
      saveSettingMutation.mutateAsync({ key: "phone", value: data.phone }),
      saveSettingMutation.mutateAsync({ key: "email", value: data.email }),
    ]).then(() => {
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      });
    });
  };

  const onInvoiceSettingsSubmit = (data: InvoiceSettingsFormData) => {
    Promise.all([
      saveSettingMutation.mutateAsync({ key: "invoicePrefix", value: data.invoicePrefix }),
      saveSettingMutation.mutateAsync({ key: "defaultTaxRate", value: data.defaultTaxRate.toString() }),
      saveSettingMutation.mutateAsync({ key: "dueDays", value: data.dueDays.toString() }),
    ]).then(() => {
      toast({
        title: "Success",
        description: "Invoice settings saved successfully",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to save invoice settings",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="settings-page">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Configure your invoice preferences and payment details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Currency Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground">Currency Settings</h3>
            </div>
            <form onSubmit={currencyForm.handleSubmit(onCurrencySubmit)} className="space-y-4">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  value={currencyForm.watch("defaultCurrency")}
                  onValueChange={(value) => currencyForm.setValue("defaultCurrency", value)}
                >
                  <SelectTrigger data-testid="select-default-currency">
                    <SelectValue placeholder="Select default currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                    <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  </SelectContent>
                </Select>
                {currencyForm.formState.errors.defaultCurrency && (
                  <p className="text-sm text-destructive mt-1">
                    {currencyForm.formState.errors.defaultCurrency.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={saveSettingMutation.isPending}
                data-testid="button-save-currency"
              >
                Save Currency Settings
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>
            </div>
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  {...paymentForm.register("bankName")}
                  placeholder="Enter bank name"
                  data-testid="input-bank-name"
                />
                {paymentForm.formState.errors.bankName && (
                  <p className="text-sm text-destructive mt-1">
                    {paymentForm.formState.errors.bankName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  {...paymentForm.register("accountNumber")}
                  placeholder="Enter account number"
                  data-testid="input-account-number"
                />
                {paymentForm.formState.errors.accountNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {paymentForm.formState.errors.accountNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  {...paymentForm.register("ifscCode")}
                  placeholder="Enter IFSC code"
                  data-testid="input-ifsc-code"
                />
                {paymentForm.formState.errors.ifscCode && (
                  <p className="text-sm text-destructive mt-1">
                    {paymentForm.formState.errors.ifscCode.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  {...paymentForm.register("upiId")}
                  placeholder="Enter UPI ID"
                  data-testid="input-upi-id"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be displayed as text only in invoice footer
                </p>
                {paymentForm.formState.errors.upiId && (
                  <p className="text-sm text-destructive mt-1">
                    {paymentForm.formState.errors.upiId.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={saveSettingMutation.isPending}
                data-testid="button-save-payment"
              >
                Save Payment Details
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
            </div>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  {...companyForm.register("companyName")}
                  placeholder="Enter company name"
                  data-testid="input-company-name"
                />
                {companyForm.formState.errors.companyName && (
                  <p className="text-sm text-destructive mt-1">
                    {companyForm.formState.errors.companyName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...companyForm.register("address")}
                  placeholder="Enter company address"
                  rows={3}
                  data-testid="input-company-address"
                />
                {companyForm.formState.errors.address && (
                  <p className="text-sm text-destructive mt-1">
                    {companyForm.formState.errors.address.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...companyForm.register("phone")}
                    placeholder="Enter phone number"
                    data-testid="input-company-phone"
                  />
                  {companyForm.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {companyForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...companyForm.register("email")}
                    placeholder="Enter email address"
                    data-testid="input-company-email"
                  />
                  {companyForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {companyForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={saveSettingMutation.isPending}
                data-testid="button-save-company"
              >
                Update Company Info
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invoice Settings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-foreground">Invoice Settings</h3>
            </div>
            <form onSubmit={invoiceSettingsForm.handleSubmit(onInvoiceSettingsSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  {...invoiceSettingsForm.register("invoicePrefix")}
                  placeholder="Enter invoice prefix"
                  data-testid="input-invoice-prefix"
                />
                {invoiceSettingsForm.formState.errors.invoicePrefix && (
                  <p className="text-sm text-destructive mt-1">
                    {invoiceSettingsForm.formState.errors.invoicePrefix.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  step="0.01"
                  {...invoiceSettingsForm.register("defaultTaxRate", { valueAsNumber: true })}
                  placeholder="Enter default tax rate"
                  data-testid="input-default-tax-rate"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is used as default when adding new items
                </p>
                {invoiceSettingsForm.formState.errors.defaultTaxRate && (
                  <p className="text-sm text-destructive mt-1">
                    {invoiceSettingsForm.formState.errors.defaultTaxRate.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="dueDays">Due Days</Label>
                <Input
                  id="dueDays"
                  type="number"
                  {...invoiceSettingsForm.register("dueDays", { valueAsNumber: true })}
                  placeholder="Enter due days"
                  data-testid="input-due-days"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default payment due days from invoice date
                </p>
                {invoiceSettingsForm.formState.errors.dueDays && (
                  <p className="text-sm text-destructive mt-1">
                    {invoiceSettingsForm.formState.errors.dueDays.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={saveSettingMutation.isPending}
                data-testid="button-save-invoice-settings"
              >
                Save Invoice Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
