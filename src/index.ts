import express from "express";
import compression from "compression";

import { init } from "./routes";
import { initiateConnection } from "./services";
// import middlewares from "./middlewares";

const port = process.env.PORT || 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

init(express.Router(), app);
initiateConnection().then(() => {
  app.listen(port, async () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
});
