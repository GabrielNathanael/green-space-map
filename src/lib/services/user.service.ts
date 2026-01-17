import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { RegisterInput } from "@/lib/validators/auth.validator";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/utils/errors";

/**
 * User Service
 * Handles user-related business logic
 */
export class UserService {
  /**
   * Register new user
   */
  static async register(input: RegisterInput) {
    const { email, password, name } = input;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        passwordHash: true,
      },
    });

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string }
  ) {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  /**
   * Verify password
   */
  static async verifyPassword(email: string, password: string) {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
