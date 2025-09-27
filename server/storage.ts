import { 
  clients, 
  invoices, 
  invoiceItems, 
  settings,
  users,
  type Client, 
  type InsertClient,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type InvoiceWithDetails,
  type Setting,
  type InsertSetting,
  type User,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<boolean>;

  // Invoice methods
  getInvoices(): Promise<InvoiceWithDetails[]>;
  getInvoice(id: string): Promise<InvoiceWithDetails | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<boolean>;
  getNextInvoiceNumber(): Promise<string>;

  // Invoice item methods
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: string, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem>;
  deleteInvoiceItem(id: string): Promise<boolean>;
  deleteInvoiceItems(invoiceId: string): Promise<boolean>;

  // Settings methods
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalClients: number;
    totalInvoices: number;
    pendingAmount: string;
    paidAmount: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(asc(clients.name));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getInvoices(): Promise<InvoiceWithDetails[]> {
    const invoicesData = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .orderBy(desc(invoices.createdAt));

    const result: InvoiceWithDetails[] = [];

    for (const row of invoicesData) {
      const items = await this.getInvoiceItems(row.invoices.id);
      result.push({
        ...row.invoices,
        client: row.clients!,
        items,
      });
    }

    return result;
  }

  async getInvoice(id: string): Promise<InvoiceWithDetails | undefined> {
    const [invoiceData] = await db
      .select()
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.id, id));

    if (!invoiceData) return undefined;

    const items = await this.getInvoiceItems(id);

    return {
      ...invoiceData.invoices,
      client: invoiceData.clients!,
      items,
    };
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const updateData = {
      ...invoice,
      updatedAt: new Date(),
    };
    
    const [updatedInvoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const lastInvoice = await db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    if (lastInvoice.length === 0) {
      return "INV-001";
    }

    const lastNumber = lastInvoice[0].invoiceNumber;
    const numberPart = parseInt(lastNumber.split('-')[1]) || 0;
    return `INV-${String(numberPart + 1).padStart(3, '0')}`;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(asc(invoiceItems.createdAt));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async updateInvoiceItem(id: string, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem> {
    const [updatedItem] = await db
      .update(invoiceItems)
      .set(item)
      .where(eq(invoiceItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteInvoiceItem(id: string): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteInvoiceItems(invoiceId: string): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
    return (result.rowCount || 0) >= 0;
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(asc(settings.key));
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(setting.key);
    
    if (existing) {
      const [updatedSetting] = await db
        .update(settings)
        .set({ value: setting.value, updatedAt: new Date() })
        .where(eq(settings.key, setting.key))
        .returning();
      return updatedSetting;
    } else {
      const [newSetting] = await db.insert(settings).values(setting).returning();
      return newSetting;
    }
  }

  async getDashboardStats(): Promise<{
    totalClients: number;
    totalInvoices: number;
    pendingAmount: string;
    paidAmount: string;
  }> {
    const clientCount = await db.select().from(clients);
    const allInvoices = await db.select().from(invoices);

    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = allInvoices.filter(inv => inv.status !== 'paid');

    const paidAmount = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.grandTotal), 0);

    return {
      totalClients: clientCount.length,
      totalInvoices: allInvoices.length,
      pendingAmount: pendingAmount.toFixed(2),
      paidAmount: paidAmount.toFixed(2),
    };
  }
}

export const storage = new DatabaseStorage();
