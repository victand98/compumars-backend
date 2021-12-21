import { Request } from "express";

export interface SingleResource {
  name: string;
  slug: string;
  roles: Permission[];
}

export interface Permission {
  role: string;
  create: boolean;
  delete: boolean;
  update: boolean;
  read: boolean;
}

export interface CustomRequest<T> extends Request {
  body: T;
}
