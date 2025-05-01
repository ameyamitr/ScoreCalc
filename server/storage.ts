import { 
  users, 
  serviceHours, 
  type User, 
  type InsertUser, 
  type InsertServiceHours,
  type ServiceHours
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Service hours methods
  getServiceHoursByUserId(userId: number): Promise<ServiceHours[]>;
  getServiceHoursById(id: number): Promise<ServiceHours | undefined>;
  addServiceHours(data: InsertServiceHours): Promise<ServiceHours>;
  updateServiceHours(id: number, data: Partial<ServiceHours>): Promise<ServiceHours | undefined>;
  deleteServiceHours(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private serviceHoursData: Map<number, ServiceHours>;
  private userId: number;
  private serviceHoursId: number;

  constructor() {
    this.users = new Map();
    this.serviceHoursData = new Map();
    this.userId = 1;
    this.serviceHoursId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getServiceHoursByUserId(userId: number): Promise<ServiceHours[]> {
    return Array.from(this.serviceHoursData.values()).filter(
      (record) => record.userId === userId,
    );
  }

  async getServiceHoursById(id: number): Promise<ServiceHours | undefined> {
    return this.serviceHoursData.get(id);
  }

  async addServiceHours(data: InsertServiceHours): Promise<ServiceHours> {
    const id = this.serviceHoursId++;
    const serviceHoursRecord: ServiceHours = { 
      ...data, 
      id, 
      verified: false 
    };
    this.serviceHoursData.set(id, serviceHoursRecord);
    return serviceHoursRecord;
  }

  async updateServiceHours(id: number, data: Partial<ServiceHours>): Promise<ServiceHours | undefined> {
    const existingRecord = this.serviceHoursData.get(id);
    if (!existingRecord) {
      return undefined;
    }

    const updatedRecord = { ...existingRecord, ...data };
    this.serviceHoursData.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteServiceHours(id: number): Promise<void> {
    this.serviceHoursData.delete(id);
  }
}

export const storage = new MemStorage();
