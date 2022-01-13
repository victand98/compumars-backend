import mongoose from "mongoose";
import { UserDocument } from "./User.model";

export interface ActivationTokenDocument extends mongoose.Document {
  user: UserDocument["id"];
  token: string;
  expires: number;
  createdAt: Date;
  updatedAt: Date;
  isExpired: boolean;
}

const ActivationTokenSchema = new mongoose.Schema<ActivationTokenDocument>(
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
  },
  { timestamps: true }
);

ActivationTokenSchema.virtual("isExpired").get(function (this: {
  expires: number;
}) {
  return Date.now() >= this.expires;
});

ActivationTokenSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

export const ActivationToken = mongoose.model<ActivationTokenDocument>(
  "ActivationToken",
  ActivationTokenSchema
);
