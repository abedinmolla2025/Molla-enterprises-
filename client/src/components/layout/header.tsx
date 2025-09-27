import { Building2, FileText, Phone, Mail } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="blue-ocean-header h-1"></div>
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold font-poppins">
                <span className="blue-ocean-text-primary">MOLLA</span>
                <span className="blue-ocean-text-secondary">ENTERPRISES</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Invoice Management System
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-blue-100 px-3 py-1 rounded">
                <span className="blue-ocean-text-primary font-semibold text-sm">
                  INVOICE GENERATOR
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center justify-end space-x-1">
                <Building2 className="w-3 h-3" />
                <span>BAGNAN, HOWRAH, WEST BENGAL 711303</span>
              </p>
              <p className="flex items-center justify-end space-x-1">
                <Phone className="w-3 h-3" />
                <span>9681766016</span>
                <span className="mx-1">|</span>
                <Mail className="w-3 h-3" />
                <span>abedinmolla1@gmail.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
