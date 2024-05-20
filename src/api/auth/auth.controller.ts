import { NextFunction, Request, Response } from "express";
import { authenticate, logout } from "../../middlewares";
import { User } from "../../types";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { getConfig } from "src/utils";
import { google } from "googleapis";
import * as admin from "google-admin-sdk";

class RawAuthController extends OAuth2Client {
  private readonly config: any;
  private readonly auth: any;

  constructor() {
    super({
      clientId: getConfig().googleClientId,
      clientSecret: getConfig().googleClientSecret,
    });
    this.config = getConfig();

    const serviceAccount = JSON.parse(
      Buffer.from(this.config.googleServiceAccount, "base64").toString("utf8")
    );
    this.auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        "https://www.googleapis.com/auth/admin.directory.group.member.readonly",
      ],
    });
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

    // Check if the user is part of the specific Google Group
    const groupEmail = this.config.googleGroupEmail; // Set this environment variable on Vercel
    const isInGroup = await this.isUserInGroup(email!, groupEmail!);
    if (!isInGroup) {
      return res
        .status(403)
        .json({ message: "User is not a member of the required group" });
    }
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

  private isUserInGroup = async (email: string, groupEmail: string) => {
    try {
      const authClient = await this.auth.getClient();
      google.options({ auth: authClient });

      const admin = google.admin("directory_v1");
      const response = await admin.members.hasMember({
        groupKey: groupEmail,
        memberKey: email,
      });

      return response.data.isMember;
    } catch (error) {
      console.error("Error checking group membership:", error);
      throw error;
    }
  };
}

export const AuthController = new RawAuthController();
