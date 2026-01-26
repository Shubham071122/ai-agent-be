import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/User";
import crypto from "crypto";

const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      email,
      passwordHash: hashPassword(password),
      role: role || "USER", // Default to USER
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log("LOGIN: ", email, password);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret: Secret = process.env.JWT_SECRET || "secret";
    const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
    const options: SignOptions = { expiresIn: expiresIn as any };

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      secret,
      options,
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
