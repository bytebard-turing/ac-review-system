import { Router } from "express";
import { CodeSampleController } from "./code-edit-sample.controller";

export const CodeSampleRouter = (router: Router) => {
  router.get("/api/code-samples", CodeSampleController.getFiles);
  router.get("/api/code-samples/:id/edit", CodeSampleController.getFileById);
  router.post("/api/code-samples/save", CodeSampleController.saveReview);

};
