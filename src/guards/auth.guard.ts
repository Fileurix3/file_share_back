import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedException("Unauthorized");
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: unknown) => {
      if (err) {
        res.clearCookie("token");
        throw new UnauthorizedException("Unauthorized");
      }
    });
    return true;
  }
}
