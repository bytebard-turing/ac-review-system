import { NextFunction, Request, Response } from "express";
import { authenticate, logout } from "../../middlewares";
import { User } from "../../types";
import { OAuth2Client, TokenPayload } from "google-auth-library";

class RawAuthController extends OAuth2Client {
  constructor() {
    super();
  }

  public loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { credentialResponse } = req.body;
    if (!credentialResponse) {
      next({
        statusCode: 400,
        message: "access token must be provied",
      });
      return;
    }
    const { payload } = (await this.verifyIdToken({
      idToken: credentialResponse.credential,
      audience: credentialResponse.client_id,
    })) as unknown as {
      payload: TokenPayload & { jti?: string };
    };
    const { exp, name, email, jti } = payload;
    const result = await authenticate({ name, email, jti }, exp);
    res.status(200).json({
      data: { ...payload, ...result },
      message: "User has logged in successfully.",
    });
    next();
  };

  public logoutUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.headers["authorization"] as string;
    const result = await logout(token);
    if (!result) {
      res.status(400).json({
        data: null,
        message: "Bad request.",
      });
      return;
    }
    res.status(200).json({
      data: result,
      message: "User has been logged out successfully.",
    });
    next();
  };
}

export const AuthController = new RawAuthController();
