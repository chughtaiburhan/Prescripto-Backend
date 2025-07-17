import { NextRequest } from "next/server";
import dbConnect from "./db";

// Database operation interfaces
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  select?: string;
  populate?: string | string[];
  lean?: boolean;
}

export interface SearchOptions {
  searchTerm?: string;
  searchFields?: string[];
  filters?: Record<string, any>;
}

// Common database operations
export class DatabaseService {
  // Generic find with pagination and search
  static async findWithPagination<T>(
    model: any,
    options: QueryOptions & SearchOptions = {}  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    await dbConnect();

    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      select,
      populate,
      lean = true,
      searchTerm,
      searchFields = [],
      filters = {}
    } = options;

    // Build query
    let query: any = filters;

    // Add search functionality
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields.map(field => ({ [field]: new RegExp(searchTerm, "i") }));
      query.$or = searchConditions;
    }

    // Build sort object
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Execute query
    const [data, total] = await Promise.all([
      model
        .find(query)
        .select(select)
        .populate(populate)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(lean),
      model.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // Generic find by ID with population
  static async findById<T>(
    model: any,
    id: string,
    options: { select?: string; populate?: string | string; lean?: boolean } = {}
  ): Promise<T | null> {
    await dbConnect();

    const { select, populate, lean = true } = options;

    return model
      .findById(id)
      .select(select)
      .populate(populate)
      .lean(lean);
  }

  // Generic create with validation
  static async create<T>(model: any, data: any): Promise<T> {
    await dbConnect();
    return model.create(data);
  }

  // Generic update by ID
  static async updateById<T>(
    model: any,
    id: string,
    data: any,
    options: { new?: boolean; runValidators?: boolean } = {}
  ): Promise<T | null> {
    await dbConnect();

    const { new: returnNew = true, runValidators = true } = options;

    return model.findByIdAndUpdate(
      id,
      data,
      { new: returnNew, runValidators }
    );
  }

  // Generic delete by ID
  static async deleteById(model: any, id: string): Promise<boolean> {
    await dbConnect();
    const result = await model.findByIdAndDelete(id);
    return !!result;
  }

  // Generic find one with conditions
  static async findOne<T>(
    model: any,
    conditions: any,
    options: { select?: string; populate?: string | string; lean?: boolean } = {}
  ): Promise<T | null> {
    await dbConnect();

    const { select, populate, lean = true } = options;

    return model
      .findOne(conditions)
      .select(select)
      .populate(populate)
      .lean(lean);
  }

  // Generic exists check
  static async exists(model: any, conditions: any): Promise<boolean> {
    await dbConnect();
    const count = await model.countDocuments(conditions);
    return count > 0;
  }

  // Bulk operations
  static async bulkCreate<T>(model: any, dataArray: any[]): Promise<T[]> {
    await dbConnect();
    return model.insertMany(dataArray);
  }

  static async bulkUpdate(
    model: any,
    filter: any,
    update: any
  ): Promise<{ modifiedCount: number }> {
    await dbConnect();
    const result = await model.updateMany(filter, update);
    return { modifiedCount: result.modifiedCount };
  }

  static async bulkDelete(
    model: any,
    filter: any
  ): Promise<{ deletedCount: number }> {
    await dbConnect();
    const result = await model.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }
}

// Specialized services for specific models
export class UserService extends DatabaseService {
  static async findByEmail(email: string) {
    return this.findOne(
      (await import("@/models/User")).default,
      { email: email.toLowerCase().trim() },
      { select: "-password -verificationCode -resetCode" }
    );
  }

  static async createUser(userData: any) {
    const User = (await import("@/models/User")).default;
    return this.create(User, userData);
  }

  static async updateUserProfile(userId: string, updateData: any) {
    const User = (await import("@/models/User")).default;
    return this.updateById(User, userId, updateData, { select: "-password" });
  }
}

export class DoctorService extends DatabaseService {
  static async findBySpeciality(speciality: string) {
    return this.findWithPagination(
      (await import("@/models/Doctor")).default,
      {
        filters: { speciality: { $regex: speciality, $options: "i" } },
        sortBy: "name",
        sortOrder: "asc"
      }
    );
  }

  static async findAvailable() {
    return this.findWithPagination(
      (await import("@/models/Doctor")).default,
      {
        filters: { available: true },
        sortBy: "name",
        sortOrder: "asc"
      }
    );
  }

  static async updateAvailability(doctorId: string, available: boolean) {
    const Doctor = (await import("@/models/Doctor")).default;
    return this.updateById(Doctor, doctorId, { available });
  }

  static async updateSlotBooked(doctorId: string, slotDate: string, slotTime: string) {
    const Doctor = (await import("@/models/Doctor")).default;
    const doctor = await this.findById(Doctor, doctorId);
    
    if (!doctor) return null;

    const slot_booked = doctor.slot_booked || {};
    if (slot_booked[slotDate]) {
      slot_booked[slotDate].push(slotTime);
    } else {
      slot_booked[slotDate] = [slotTime];
    }

    return this.updateById(Doctor, doctorId, { slot_booked });
  }
}

export class AppointmentService extends DatabaseService {
  static async findByUser(userId: string) {
    return this.findWithPagination(
      (await import("@/models/Appointment")).default,
      {
        filters: { userId },
        populate: "docId,userId",
        sortBy: "createdAt",
        sortOrder: "desc"
      }
    );
  }

  static async findByDoctor(doctorId: string) {
    return this.findWithPagination(
      (await import("@/models/Appointment")).default,
      {
        filters: { docId: doctorId },
        populate: "userId",
        sortBy: "createdAt",
        sortOrder: "desc"
      }
    );
  }

  static async createAppointment(appointmentData: any) {
    const Appointment = (await import("@/models/Appointment")).default;
    return this.create(Appointment, appointmentData);
  }

  static async cancelAppointment(appointmentId: string, userId: string) {
    const Appointment = (await import("@/models/Appointment")).default;
    
    // Verify ownership
    const appointment = await this.findById(Appointment, appointmentId);
    if (!appointment || appointment.userId.toString() !== userId) {
      throw new Error("Unauthorized or appointment not found");
    }

    return this.updateById(Appointment, appointmentId, { cancelled: true });
  }
}

// Query builders for complex operations
export class QueryBuilder {
  static buildSearchQuery(searchTerm: string, fields: string[]) {
    if (!searchTerm) return {};
    const searchConditions = fields.map(field => ({ [field]: new RegExp(searchTerm, "i") }));
    
    return { $or: searchConditions };
  }

  static buildDateRangeQuery(startDate: string, endDate: string, field: string = "createdAt") {
    const query: any = {};
    if (startDate) {
      query[field] = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query[field] = { ...query[field], $lte: new Date(endDate) };
    }
    
    return Object.keys(query).length > 0 ? query : {};
  }

  static buildStatusQuery(status: string | string[], field: string = "status") {
    if (!status) return {};
    if (Array.isArray(status)) {
      return { [field]: { $in: status } };
    }
    
    return { [field]: status };
  }

  static buildPaginationQuery(page: number, limit: number) {
    return {
      skip: (page - 1) * limit,
      limit
    };
  }
}

// Performance optimization helpers
export class PerformanceOptimizer {
  // Add indexes for common queries
  static async createIndexes() {
    await dbConnect();
    
    const User = (await import("@/models/User")).default;
    const Doctor = (await import("@/models/Doctor")).default;
    const Appointment = (await import("@/models/Appointment")).default;

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });

    // Doctor indexes
    await Doctor.collection.createIndex({ email: 1 }, { unique: true });
    await Doctor.collection.createIndex({ speciality: 1 });
    await Doctor.collection.createIndex({ available: 1 });
    await Doctor.collection.createIndex({ createdAt: -1 });

    // Appointment indexes
    await Appointment.collection.createIndex({ userId: 1 });
    await Appointment.collection.createIndex({ docId: 1 });
    await Appointment.collection.createIndex({ slotDate: 1 });
    await Appointment.collection.createIndex({ createdAt: -1 });
    await Appointment.collection.createIndex({ cancelled: 1 });
  }

  // Aggregation helpers
  static async getStats() {
    await dbConnect();
    
    const User = (await import("@/models/User")).default;
    const Doctor = (await import("@/models/Doctor")).default;
    const Appointment = (await import("@/models/Appointment")).default;

    const [userStats, doctorStats, appointmentStats] = await Promise.all([
      User.aggregate(
        { $group: { _id: null, totalUsers: { $sum: 1 } } }
      ),
      Doctor.aggregate(
        { $group: { _id: null, totalDoctors: { $sum: 1 }, availableDoctors: { $sum: { $cond: { $eq: ["$available", true] }, 1, 0 } } } }
      ),
      Appointment.aggregate(
        { $group: { _id: null, totalAppointments: { $sum: 1 }, cancelledAppointments: { $sum: { $cond: { $eq: ["$cancelled", true] }, 1, 0 } } } }
      )
    ]);

    return {
      users: userStats[0]?.totalUsers || 0,
      doctors: {
        total: doctorStats[0]?.totalDoctors || 0,
        available: doctorStats[0]?.availableDoctors || 0
      },
      appointments: {
        total: appointmentStats[0]?.totalAppointments || 0,
        cancelled: appointmentStats[0]?.cancelledAppointments || 0     }
    };
  }
} 