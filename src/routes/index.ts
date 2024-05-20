import { Application, NextFunction, Router, application } from "express";
import { isAuthenticated } from "../middlewares";
import { AuthRoute } from "../api/auth/auth.route";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import contentLength from "express-content-length-validator";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { getConfig } from "../utils";
import { CodeSampleRouter } from "../api/code-edit-sample/code-edit-sample.route";

export const init = (router: Router, app: Application) => {
  const config = getConfig()
  app.use(compression());
  app.use(
    bodyParser.urlencoded({
      limit: "200mb",
      extended: true,
      parameterLimit: 5000,
    })
  );

  app.use(bodyParser.json({ limit: "200mb" }));
  app.use(cookieParser());
  app.use(contentLength.validateMax({ max: 5000 }));

  // session cookie setup
  app.use(
    cookieSession({
      name: "session",
      keys: [config.secret],
      // Cookie Options
      maxAge: 86400, // 24 hours
    })
  );

  // cors options

  router.use(cors());

  // helmet for route protection
  app.use(helmet());

  router.use("/api/logout", isAuthenticated);
  router.use("/api/code-samples*", isAuthenticated);

  AuthRoute(router);
  CodeSampleRouter(router);

  app.use("/", router);
};
