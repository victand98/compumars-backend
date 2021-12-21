import mongoose from "mongoose";
import { RoleDocument } from "./Role.model";

interface Roles {
  role: RoleDocument["_id"];
  create: boolean;
  delete: boolean;
  update: boolean;
  read: boolean;
}

export interface ResourceDocument extends mongoose.Document {
  name: string;
  slug: string;
  status: boolean;
  roles: Roles[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new mongoose.Schema<ResourceDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: {
      type: Boolean,
      default: true,
    },
    roles: [
      {
        role: {
          type: mongoose.Types.ObjectId,
          ref: "Role",
          required: true,
        },
        create: { type: Boolean },
        delete: { type: Boolean },
        update: { type: Boolean },
        read: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

export const Resource = mongoose.model<ResourceDocument>(
  "Resource",
  ResourceSchema
);
