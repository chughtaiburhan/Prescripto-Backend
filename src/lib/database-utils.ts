import { Model } from "mongoose"; // Import Model from mongoose

// Assuming dbConnect is defined elsewhere and connects to MongoDB
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
  /**
   * Generic find with pagination and search capabilities.
   * @param model The Mongoose model to query.
   * @param options Query and search options.
   * @returns An object containing the data and pagination information.
   */
  static async findWithPagination<T>(
    model: any,
    options: QueryOptions & SearchOptions = {}
  ): Promise<{
    data: any[];
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
      filters = {},
    } = options;

    // Build query object
    let query: Record<string, any> = { ...filters }; // Initialize with filters

    // Add search functionality
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields.map((field) => ({
        [field]: new RegExp(searchTerm, "i"),
      }));
      query.$or = searchConditions;
    }

    // Build sort object
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Execute query
    let dataQuery = model.find(query);

    if (select) {
      dataQuery = dataQuery.select(select);
    }

    if (populate) {
      dataQuery = dataQuery.populate(populate);
    }

    if (lean) {
      dataQuery = dataQuery.lean();
    }

    const [data, total] = await Promise.all([
      dataQuery
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      model.countDocuments(query).exec(),
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
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Generic find by ID
   * @param model The Mongoose model to query.
   * @param id The ID of the document.
   * @param options Query options (select, populate, lean).
   * @returns The found document or null.
   */
  static async findById<T>(
    model: any,
    id: string,
    options: {
      select?: string;
      populate?: string | string[];
      lean?: boolean;
    } = {}
  ): Promise<any> {
    await dbConnect();

    const { select, populate, lean = true } = options;

    let query = model.findById(id);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return query.exec();
  }

  /**
   * Generic create with validation.
   * @param model The Mongoose model to create a document in.
   * @param data The data for the new document.
   * @returns The created document.
   */
  static async create<T>(model: any, data: any): Promise<any> {
    await dbConnect();
    return model.create(data);
  }

  /**
   * Generic update by ID.
   * @param model The Mongoose model to update.
   * @param id The ID of the document to update.
   * @param data The update data.
   * @param options Update options (new, runValidators, select).
   * @returns The updated document or null.
   */
  static async updateById<T>(
    model: any,
    id: string,
    data: any,
    options: { new?: boolean; runValidators?: boolean; select?: string } = {}
  ): Promise<any> {
    await dbConnect();

    const { new: returnNew = true, runValidators = true, select } = options;

    const result = model.findByIdAndUpdate(id, data, {
      new: returnNew,
      runValidators,
    });

    if (select) {
      return result.select(select);
    }

    return result;
  }

  /**
   * Generic delete by ID.
   * @param model The Mongoose model to delete from.
   * @param id The ID of the document to delete.
   * @returns True if deleted, false otherwise.
   */
  static async deleteById(model: any, id: string): Promise<boolean> {
    await dbConnect();
    const result = await model.findByIdAndDelete(id);
    return !!result;
  }

  // Generic find one with conditions
  static async findOne<T>(
    model: any,
    conditions: any,
    options: {
      select?: string;
      populate?: string | string[];
      lean?: boolean;
    } = {}
  ): Promise<any> {
    await dbConnect();

    const { select, populate, lean = true } = options;

    let query = model.findOne(conditions);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return query.exec();
  }

  // Generic exists check
  static async exists(model: any, conditions: any): Promise<boolean> {
    await dbConnect();
    const count = await model.countDocuments(conditions);
    return count > 0;
  }

  // Bulk operations
  static async bulkCreate<T>(model: any, dataArray: any[]): Promise<any[]> {
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

// Define a basic interface for Mongoose documents if not already defined globally
interface MongooseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Assuming User, Doctor, Appointment models exist and extend MongooseDocument
interface IUser extends MongooseDocument {
  email: string;
  // Add other user properties as needed
}

interface IDoctor extends MongooseDocument {
  email: string;
  speciality: string;
  available: boolean;
  slot_booked?: Record<string, string[]>; // Define slot_booked type
  // Add other doctor properties as needed
}

interface IAppointment extends MongooseDocument {
  userId: string;
  docId: string;
  slotDate: string;
  slotTime: string;
  cancelled: boolean;
  // Add other appointment properties as needed
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

  static async findByEmailForVerification(email: string) {
    return this.findOne(
      (await import("@/models/User")).default,
      { email: email.toLowerCase().trim() },
      { select: "-password -resetCode" }
    );
  }

  static async createUser(userData: any) {
    const User = (await import("@/models/User")).default;
    return this.create(User, userData);
  }

  static async updateUserProfile(userId: string, updateData: any) {
    const User = (await import("@/models/User")).default;
    return this.updateById(User, userId, updateData);
  }

  static async deleteUser(userId: string) {
    const User = (await import("@/models/User")).default;
    return this.deleteById(User, userId);
  }
}

export class DoctorService extends DatabaseService {
  static async findBySpeciality(speciality: string) {
    return this.findWithPagination((await import("@/models/Doctor")).default, {
      filters: { speciality: { $regex: speciality, $options: "i" } },
      sortBy: "name",
      sortOrder: "asc",
    });
  }

  static async findAvailable() {
    return this.findWithPagination((await import("@/models/Doctor")).default, {
      filters: { available: true },
      sortBy: "name",
      sortOrder: "asc",
    });
  }

  static async updateAvailability(doctorId: string, available: boolean) {
    const Doctor = (await import("@/models/Doctor")).default;
    return this.updateById(Doctor, doctorId, { available });
  }

  static async updateSlotBooked(
    doctorId: string,
    slotDate: string,
    slotTime: string
  ) {
    const Doctor = (await import("@/models/Doctor")).default;
    const doctor = await this.findById(Doctor, doctorId);

    if (!doctor) return null;

    const slot_booked = (doctor as any).slot_booked || {};
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
        sortOrder: "desc",
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
        sortOrder: "desc",
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
    if (!appointment || (appointment as any).userId.toString() !== userId) {
      throw new Error("Unauthorized or appointment not found");
    }

    return this.updateById(Appointment, appointmentId, { cancelled: true });
  }
}

// Query builders for complex operations
export class QueryBuilder {
  static buildSearchQuery(searchTerm: string, fields: string[]) {
    if (!searchTerm) return {};
    const searchConditions = fields.map((field) => ({
      [field]: new RegExp(searchTerm, "i"),
    }));

    return { $or: searchConditions };
  }

  static buildDateRangeQuery(
    startDate: string,
    endDate: string,
    field: string = "createdAt"
  ) {
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
      limit,
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
      User.aggregate([{ $group: { _id: null, totalUsers: { $sum: 1 } } }]),
      Doctor.aggregate([
        {
          $group: {
            _id: null,
            totalDoctors: { $sum: 1 },
            availableDoctors: {
              $sum: { $cond: [{ $eq: ["$available", true] }, 1, 0] },
            },
          },
        },
      ]),
      Appointment.aggregate([
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            cancelledAppointments: {
              $sum: { $cond: [{ $eq: ["$cancelled", true] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    return {
      users: userStats[0]?.totalUsers || 0,
      doctors: {
        total: doctorStats[0]?.totalDoctors || 0,
        available: doctorStats[0]?.availableDoctors || 0,
      },
      appointments: {
        total: appointmentStats[0]?.totalAppointments || 0,
        cancelled: appointmentStats[0]?.cancelledAppointments || 0,
      },
    };
  }
}
