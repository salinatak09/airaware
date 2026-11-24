import "server-only";
import { userRepository, UserRepository } from "@/server/repositories/user.repository";
import { IUserData, IFamilyMember } from "@/models/User";
import { NotFoundError, ConflictError } from "@/server/utils/errors";

export class UserService {
  constructor(private userRepo: UserRepository = userRepository) {}

  async getUserById(id: string): Promise<Partial<IUserData>> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<Partial<IUserData> | null> {
    return this.userRepo.findByEmail(email);
  }

  async listUsers(filter: Record<string, unknown> = {}): Promise<Array<Partial<IUserData>>> {
    return this.userRepo.find(filter);
  }

  async createUser(data: Partial<IUserData>): Promise<Partial<IUserData>> {
    if (data.email) {
      const existing = await this.userRepo.findByEmail(data.email);
      if (existing) {
        throw new ConflictError(`User with email ${data.email} already exists.`);
      }
    }
    return this.userRepo.create(data);
  }

  async updateProfile(id: string, updates: Partial<IUserData>): Promise<Partial<IUserData>> {
    const updated = await this.userRepo.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }
    return updated;
  }

  async updateFamily(id: string, familyMembers: IFamilyMember[]): Promise<Partial<IUserData>> {
    const updated = await this.userRepo.updateFamilyMembers(id, familyMembers);
    if (!updated) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }
    return updated;
  }

  async addXP(id: string, xpEarned: number): Promise<Partial<IUserData>> {
    const current = await this.getUserById(id);
    const streak = current.gamification?.streakDays ?? 1;
    const updated = await this.userRepo.updateGamification(id, xpEarned, streak);
    return updated ?? current;
  }
}

export const userService = new UserService();
