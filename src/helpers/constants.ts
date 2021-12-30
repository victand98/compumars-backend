export const ROLES = {
  SUPER_ADMIN: {
    name: "Super Administrador",
    slug: "superadmin",
  },
  ADMIN: {
    name: "Administrador",
    slug: "admin",
  },
  MODERATOR: {
    name: "Moderador",
    slug: "moderator",
  },
  USER: {
    name: "Usuario",
    slug: "user",
  },
  GUEST: {
    name: "Invitado",
    slug: "guest",
  },
};

export const RESOURCES = {
  PRODUCTS: {
    name: "Productos",
    slug: "products",
    roles: [
      {
        role: ROLES.ADMIN.slug,
        create: true,
        delete: true,
        update: true,
        read: true,
      },
      {
        role: ROLES.MODERATOR.slug,
        create: true,
        delete: true,
        update: false,
        read: false,
      },
    ],
  },
  USERS: {
    name: "Usuarios",
    slug: "users",
    roles: [
      {
        role: ROLES.SUPER_ADMIN.slug,
        create: true,
        delete: true,
        update: true,
        read: true,
      },
      {
        role: ROLES.ADMIN.slug,
        create: true,
        delete: true,
        update: true,
        read: true,
      },
      {
        role: ROLES.MODERATOR.slug,
        create: true,
        delete: true,
        update: false,
        read: false,
      },
    ],
  },
};
