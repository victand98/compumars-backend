import mongoose from "mongoose";
import { RoleDocument } from "./Role.model";

export interface UserDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: RoleDocument["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: [true, "El campo Nombre es requerido."],
    },
    lastName: {
      type: String,
      required: [true, "El campo Apellido es requerido."],
    },
    email: {
      type: String,
      required: [true, "El campo Correo es requerido."],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "El campo Contraseña es requerido."],
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: "Role",
      required: [true, "El campo Rol es requerido."],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>("User", UserSchema);
