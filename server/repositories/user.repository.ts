import "server-only";
import { User, IUserData, IFamilyMember } from "@/models/User";
import { connectToDatabase } from "@/server/api/db/connection";
import { IBaseRepository } from "./base.repository";

// Fallback in-memory cache for development resilience when Mongo Atlas is not connected
const fallbackMemoryUsers = new Map<string, Partial<IUserData>>();

export class UserRepository implements IBaseRepository<Partial<IUserData>> {
  private async getModel() {
    try {
      await connectToDatabase();
      return User;
    } catch {
      console.warn("MongoDB unavailable; operating in development mock mode for User repository.");
      return null;
    }
  }

  async findById(id: string): Promise<Partial<IUserData> | null> {
    const Model = await this.getModel();
    if (Model) {
      try {
        const doc = await Model.findById(id).lean().exec();
        if (doc) return doc as unknown as Partial<IUserData>;
      } catch {
        // Fall back to memory
      }
    }
    return fallbackMemoryUsers.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<Partial<IUserData> | null> {
    const Model = await this.getModel();
    if (Model) {
      try {
        const doc = await Model.findOne({ email: email.toLowerCase() }).lean().exec();
        if (doc) return doc as unknown as Partial<IUserData>;
      } catch {
        // Fall back to memory
      }
    }
    for (const u of fallbackMemoryUsers.values()) {
      if (u.email?.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  async find(filter: Record<string, unknown> = {}): Promise<Array<Partial<IUserData>>> {
    const Model = await this.getModel();
    if (Model) {
      try {
        const docs = await Model.find(filter).limit(50).lean().exec();
        return docs as unknown as Array<Partial<IUserData>>;
      } catch {
        // Fall back
      }
    }
    return Array.from(fallbackMemoryUsers.values());
  }

  async create(item: Partial<IUserData>): Promise<Partial<IUserData>> {
    const Model = await this.getModel();
    if (Model) {
      try {
        const created = await Model.create(item);
        return created.toObject() as unknown as Partial<IUserData>;
      } catch {
        // Fall back
      }
    }
    const id = item._id ? String(item._id) : `user_${Date.now()}`;
    const userWithId: Partial<IUserData> = { ...item, _id: id, createdAt: new Date(), updatedAt: new Date() };
    fallbackMemoryUsers.set(id, userWithId);
    return userWithId;
  }

  async update(id: string, item: Partial<IUserData>): Promise<Partial<IUserData> | null> {
    const Model = await this.getModel();
    if (Model) {
      try {
        const updated = await Model.findByIdAndUpdate(id, { $set: item }, { new: true }).lean().exec();
        if (updated) return updated as unknown as Partial<IUserData>;
      } catch {
        // Fall back
      }
    }
    const existing = fallbackMemoryUsers.get(id);
    if (!existing) return null;
    const merged: Partial<IUserData> = { ...existing, ...item, updatedAt: new Date() };
    fallbackMemoryUsers.set(id, merged);
    return merged;
  }

  async updateFamilyMembers(id: string, members: IFamilyMember[]): Promise<Partial<IUserData> | null> {
    return this.update(id, { familyMembers: members });
  }

  async updateGamification(
    id: string,
    pointsAdd: number,
    streak: number
  ): Promise<Partial<IUserData> | null> {
    const existing = await this.findById(id);
    const currentPoints = existing?.gamification?.points ?? 0;
    const newPoints = currentPoints + pointsAdd;
    const newLevel = Math.floor(newPoints / 500) + 1;

    return this.update(id, {
      gamification: {
        points: newPoints,
        level: newLevel,
        streakDays: streak,
        lastActiveDate: new Date(),
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    const Model = await this.getModel();
    if (Model) {
      try {
        const res = await Model.findByIdAndDelete(id).exec();
        return Boolean(res);
      } catch {
        // Fall back
      }
    }
    return fallbackMemoryUsers.delete(id);
  }
}

export const userRepository = new UserRepository();
