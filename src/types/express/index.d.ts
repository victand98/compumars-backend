declare module Express {
  export interface Request {
    user: User;
  }
}

interface User {
  id: string;
  role: string;
}
