// types/express.d.ts
import { User as PassportUser } from 'passport';

declare global {
  namespace Express {
    interface User extends PassportUser {}
    
    interface Request {
      isAuthenticated(): boolean;
    }
  }
}
