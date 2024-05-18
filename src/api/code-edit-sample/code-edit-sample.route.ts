import { Router } from "express";
import { CodeSampleController } from "./code-edit-sample.controller";

export const CodeSampleRouter = (router: Router) => {
  router.get("/api/code-samples", CodeSampleController.getFiles);
  router.post("/api/code-samples/view", CodeSampleController.getFile);
  router.post("/api/code-samples/save", CodeSampleController.saveReview);
};
