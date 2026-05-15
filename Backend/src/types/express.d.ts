import type { AccessTokenPayload } from "../utils/security";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
