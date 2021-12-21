import mongoose from "mongoose";

export interface RoleDocument extends mongoose.Document {
  name: string;
  slug: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new mongoose.Schema<RoleDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Role = mongoose.model<RoleDocument>("Role", RoleSchema);
