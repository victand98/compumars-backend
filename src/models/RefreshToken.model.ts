import mongoose from "mongoose";
import { UserDocument } from "./User.model";

export interface RefreshTokenDocument extends mongoose.Document {
  user: UserDocument["id"];
  token: string;
  expires: number;
  createdByIp: string;
  createdAt: Date;
  updatedAt: Date;
  isExpired: boolean;
}

const RefreshTokenSchema = new mongoose.Schema<RefreshTokenDocument>(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "El campo Usuario es requerido."],
    },
    token: {
      type: String,
      required: [true, "El campo Token es requerido."],
    },
    expires: Number,
    createdByIp: String,
  },
  { timestamps: true }
);

RefreshTokenSchema.virtual("isExpired").get(function (this: {
  expires: number;
}) {
  return Date.now() >= this.expires;
});

RefreshTokenSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.id;
    delete ret.user;
  },
});

export const RefreshToken = mongoose.model<RefreshTokenDocument>(
  "RefreshToken",
  RefreshTokenSchema
);
