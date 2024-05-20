import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { Task, User } from "../../types";
import fs from "fs";
import os from "os";
import path from "path";
import { Storage, File, FileMetadata } from "@google-cloud/storage";
import {
  getReviewPropMap,
  getReviewerMetadata,
  getUsernameFromEmail,
  isFinalReviewer,
  isFirstReviewer,
  isSecondReviewer,
  mapPayloadToObject,
  wrapResultWithPermission,
} from "../../utils";

const prefix = "to_augment_ai_review_bucket";
const bucketName = "augment_ai";

const fileFilterPredicate = (
  file: File,
  prefix: string,
  beforeDate: string
) => {
  const [folderDate, username] = file.name.replace(`${prefix}/`, "").split("_");
  return folderDate >= beforeDate;
};

class RawCodeSampleController extends Storage {
  constructor() {
    super({
      projectId: "turing-gpt",
    });
  }

  public getFiles = async (
    req: Request & { decoded?: { email: string } },
    res: Response,
    next: NextFunction
  ) => {
    const [files] = await this.bucket(bucketName).getFiles({
      prefix,
    });
    const allFiles = files.filter((file: File) =>
      fileFilterPredicate(
        file,
        prefix,
        moment().add(-7, "days").format("YYYY-MM-DD")
      )
    );

    const result = allFiles.map((file: File) => {
      const name = file.name.replace(`${prefix}/`, "");
      const id = name.split("_").pop()?.split(".")?.[0];
      const reviewerData = file.metadata.metadata || {};
      return {
        id,
        name: file.name,
        updated: file.metadata.updated,
        ...getReviewerMetadata(reviewerData, req.decoded?.email!)
      };
    });

    const createdSamples = result.filter((rec: any) => req.decoded?.email!.includes(rec.author))
    const reviewRequestedSamples = result.filter((rec: any) => req.decoded?.email!.includes(rec.assignee))

    res.status(200).json({
      data: {
        reviewRequestedSamples,
        createdSamples
      },
      message: "",
    });
    next();
  };

  public getFile = async (
    req: Request & { decoded?: { email: string } },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, name } = req.body;
      const { json: result, metadata } = await this.downloadFile(name);
      const response = wrapResultWithPermission(
        mapPayloadToObject(result, getReviewPropMap()),
        req.decoded
      );
      res.status(200).json({
        data: {
          ...response,
          id,
          name,
        },
        message: "",
      });
    } catch {
      res.status(400).json({
        data: null,
        message: "Bad Request",
      });
    }
    next();
  };

  public saveReview = async (
    req: Request & { decoded?: { email: string } },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { reviewStatus, reviewComment, reviewerData, id, name } = req.body;
      const user = req.decoded?.email as string;
      let result: any;
      if (isFinalReviewer(user, reviewerData)) {
        result = {
          ...reviewerData,
          finalReviewerStatus: reviewStatus,
          finalReviewerComment: reviewComment,
          updated: new Date().toISOString(),
        };
      } else if (isSecondReviewer(user, reviewerData)) {
        result = {
          ...reviewerData,
          reviewerTwoStatus: reviewStatus,
          reviewerTwoComment: reviewComment,
          updated: new Date().toISOString(),
        };
      } else if (isFirstReviewer(user, reviewerData)) {
        result = {
          ...reviewerData,
          reviewerOneStatus: reviewStatus,
          reviewerOneComment: reviewComment,
          updated: new Date().toISOString(),
        };
      }
      if (result) {
        const { json } = await this.downloadFile(name);
        const payload = {
          ...json,
          reviewerData: {
            ...result,
            lastModifedBy: req.decoded?.email,
            lastUpdated: new Date().toISOString(),
          },
        };
        const fileResult = await this.uploadFile(id, name, payload);

        res.status(200).json({
          data: fileResult,
          message: "",
        });
      }
    } catch (err) {
      res.status(400).json({
        data: null,
        message: err,
      });
    }
    next();
  };

  private downloadFile = async (file: string) => {
    try {
      const tempDir = os.tmpdir();
      const downloadDir = path.join(tempDir, file?.split("_")?.pop() as string);
      const options = {
        destination: downloadDir,
      };
      const bucketFile = this.bucket(bucketName).file(file);
      const [, metadata] = await Promise.all([
        bucketFile.download(options),
        bucketFile.getMetadata(),
      ]);

      // Read the file content
      const fileContent = fs.readFileSync(downloadDir, "utf8");
      const json = JSON.parse(fileContent);
      // Delete the file
      fs.unlinkSync(downloadDir);

      return { json, metadata };
    } catch (error) {
      console.error("Error:", error);
      return {};
    }
  };

  private uploadFile = async (id: string, fileName: string, response: any) => {
    try {
      const tempDir = os.tmpdir();

      // Read the file content
      fs.writeFileSync(
        `${tempDir}/${id}.json`,
        JSON.stringify(response, null, 2)
      );

      await this.bucket(bucketName).upload(`${tempDir}/${id}.json`, {
        destination: fileName,
        metadata: {
          cacheControl: "no-store", // Set cache-control metadata,
          metadata: response?.reviewerData,
        },
      });

      // Delete the file
      fs.unlinkSync(`${tempDir}/${id}.json`);

      return response?.reviewerData;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };
}

export const CodeSampleController = new RawCodeSampleController();
