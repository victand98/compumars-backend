import mongoose from "mongoose";
import config from "config";
import { RESOURCES, ROLES } from "../helpers/constants";
import { hash } from "../helpers/utils";
import { Role } from "../models/Role.model";
import { User } from "../models/User.model";
import connect from "./database";
import log from "./logger";
import { Resource } from "../models/Resource.model";

const insertRoles = async () => {
  const roles = Object.entries(ROLES).map((role) => role[1]);

  log.info(`Inserting Roles...`);
  const rolesToInsert = roles.map((role) =>
    Role.findOneAndUpdate({ slug: role.slug }, role, { upsert: true })
  );
  await Promise.all(rolesToInsert);
  log.info("Roles inserted");
};

const insertSuperAdmin = async () => {
  const superAdminRole = await Role.findOne({ slug: ROLES.SUPER_ADMIN.slug });
  const adminUser = config.get("adminUser") as string;
  const adminPassword = config.get("adminPassword") as string;
  const userSuperAdmin = {
    firstName: "Super",
    lastName: "Administrador",
    email: adminUser,
    password: hash(adminPassword),
    role: superAdminRole?.id,
    active: true,
  };
  log.info("Inserting SuperAdmin...");
  await User.findOneAndUpdate({ email: userSuperAdmin.email }, userSuperAdmin, {
    upsert: true,
  });
  log.info("SuperAdmin inserted");
};

const insertResources = async () => {
  const resources = Object.entries(RESOURCES).map((resource) => resource[1]);
  const roles = await Role.find();
  const newResources = resources.map((resource) => {
    const resourceRoles = resource.roles.map((resourceRole) => {
      resourceRole.role = roles.find(
        (role) => role.slug === resourceRole.role
      )?.id;
      return resourceRole;
    });
    resource.roles = resourceRoles;
    return resource;
  });

  log.info(`Inserting Resources...`);
  const resourcesToInsert = newResources.map((newResource) =>
    Resource.findOneAndUpdate({ slug: newResource.slug }, newResource, {
      upsert: true,
    })
  );
  await Promise.all(resourcesToInsert);
  log.info("Resources inserted");
};

const seeders = async () => {
  try {
    await connect();
    await insertRoles();
    await insertSuperAdmin();
    await insertResources();
    mongoose.disconnect();
  } catch (error) {
    log.error(`An error occurred while saving the data: ${error}`);
    mongoose.disconnect();
  }
};

seeders();
