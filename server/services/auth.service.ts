import "server-only";
import { userService, UserService } from "./user.service";
import { UnauthorizedError, BadRequestError } from "@/server/utils/errors";
import { IUserData } from "@/models/User";

export interface RegisterDTO {
  name: string;
  email: string;
  password?: string;
  city?: string;
  country?: string;
}

export interface LoginDTO {
  email: string;
  password?: string;
}

export class AuthService {
  constructor(private userSvc: UserService = userService) {}

  async register(dto: RegisterDTO): Promise<{ user: Partial<IUserData>; token: string }> {
    if (!dto.email || !dto.name) {
      throw new BadRequestError("Name and email are required to register.");
    }

    const created = await this.userSvc.createUser({
      name: dto.name,
      email: dto.email.toLowerCase(),
      homeLocation: {
        city: dto.city || "New Delhi",
        country: dto.country || "India",
        latitude: 28.6139,
        longitude: 77.209,
      },
      familyMembers: [],
      gamification: {
        points: 50,
        level: 1,
        streakDays: 1,
        lastActiveDate: new Date(),
      },
      preferences: {
        notificationsEnabled: true,
        aqiThresholdAlert: 150,
        temperatureUnit: "celsius",
      },
    });

    const token = `airaware_jwt_${Buffer.from(created.email || "").toString("base64")}_${Date.now()}`;

    return {
      user: created,
      token,
    };
  }

  async login(dto: LoginDTO): Promise<{ user: Partial<IUserData>; token: string }> {
    if (!dto.email) {
      throw new BadRequestError("Email is required to login.");
    }

    let user = await this.userSvc.getUserByEmail(dto.email);
    if (!user) {
      // In development, auto-provision user if logging in for demo convenience
      if (process.env.NODE_ENV !== "production") {
        user = await this.userSvc.createUser({
          name: dto.email.split("@")[0],
          email: dto.email.toLowerCase(),
          homeLocation: {
            city: "New Delhi",
            country: "India",
            latitude: 28.6139,
            longitude: 77.209,
          },
          familyMembers: [],
          gamification: { points: 100, level: 1, streakDays: 2 },
          preferences: { notificationsEnabled: true, aqiThresholdAlert: 150, temperatureUnit: "celsius" },
        });
      } else {
        throw new UnauthorizedError("Invalid email or credentials.");
      }
    }

    const token = `airaware_jwt_${Buffer.from(user.email || "").toString("base64")}_${Date.now()}`;

    return {
      user,
      token,
    };
  }
}

export const authService = new AuthService();
