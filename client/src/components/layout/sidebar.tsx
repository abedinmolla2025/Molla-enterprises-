import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  FileText, 
  Plus, 
  Settings,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    label: "Create Invoice",
    href: "/create-invoice",
    icon: Plus,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-sm border-r" data-testid="sidebar">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <button
                    className={cn(
                      "w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
