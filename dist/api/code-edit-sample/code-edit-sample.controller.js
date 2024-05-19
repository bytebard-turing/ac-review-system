"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSampleController = void 0;
const moment_1 = __importDefault(require("moment"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const storage_1 = require("@google-cloud/storage");
const utils_1 = require("../../utils");
const prefix = "to_augment_ai_review_bucket";
const bucketName = "augment_ai";
const fileFilterPredicate = (file, prefix, user, beforeDate) => {
    if (!user)
        return true;
    const [folderDate, username] = file.name.replace(`${prefix}/`, "").split("_");
    return user === username && folderDate >= beforeDate;
};
class RawCodeSampleController extends storage_1.Storage {
    constructor() {
        super({
            projectId: "turing-gpt",
        });
        this.getFiles = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const [files] = yield this.bucket(bucketName).getFiles({
                prefix,
            });
            const allFiles = files.filter((file) => {
                var _a;
                return fileFilterPredicate(file, prefix, (0, utils_1.getUsernameFromEmail)((_a = req.decoded) === null || _a === void 0 ? void 0 : _a.email), (0, moment_1.default)().add(-7, "days").format("YYYY-MM-DD"));
            });
            const result = allFiles.map((file) => {
                var _a, _b;
                const name = file.name.replace(`${prefix}/`, "");
                const id = (_b = (_a = name.split("_").pop()) === null || _a === void 0 ? void 0 : _a.split(".")) === null || _b === void 0 ? void 0 : _b[0];
                return {
                    id,
                    name: file.name,
                    metadata: file.metadata,
                    updated: file.metadata.updated,
                };
            });
            res.status(200).json({
                data: result,
                message: "",
            });
            next();
        });
        this.getFile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, name } = req.body;
                const { json: result, metadata } = yield this.downloadFile(name);
                const response = (0, utils_1.wrapResultWithPermission)((0, utils_1.mapPayloadToObject)(result, (0, utils_1.getReviewPropMap)()), req.decoded);
                res.status(200).json({
                    data: Object.assign(Object.assign({}, response), { id,
                        name }),
                    message: "",
                });
            }
            catch (_a) {
                res.status(400).json({
                    data: null,
                    message: "Bad Request",
                });
            }
            next();
        });
        this.saveReview = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            try {
                const { reviewStatus, reviewComment, reviewerData, id, name } = req.body;
                const user = (_b = req.decoded) === null || _b === void 0 ? void 0 : _b.email;
                let result;
                if ((0, utils_1.isFinalReviewer)(user, reviewerData)) {
                    result = Object.assign(Object.assign({}, reviewerData), { finalReviewerStatus: reviewStatus, finalReviewerComment: reviewComment, updated: new Date().toISOString() });
                }
                else if ((0, utils_1.isSecondReviewer)(user, reviewerData)) {
                    result = Object.assign(Object.assign({}, reviewerData), { reviewerTwoStatus: reviewStatus, reviewerTwoComment: reviewComment, updated: new Date().toISOString() });
                }
                else if ((0, utils_1.isFirstReviewer)(user, reviewerData)) {
                    result = Object.assign(Object.assign({}, reviewerData), { reviewerOneStatus: reviewStatus, reviewerOneComment: reviewComment, updated: new Date().toISOString() });
                }
                if (result) {
                    const { json, metadata } = yield this.downloadFile(name);
                    const payload = Object.assign(Object.assign({}, json), { reviewerData: Object.assign(Object.assign({}, result), { lastModifedBy: (_c = req.decoded) === null || _c === void 0 ? void 0 : _c.email, lastUpdated: new Date().toISOString() }) });
                    const fileResult = yield this.uploadFile(id, name, payload);
                    res.status(200).json({
                        data: fileResult,
                        message: "",
                    });
                }
            }
            catch (err) {
                res.status(400).json({
                    data: null,
                    message: err,
                });
            }
            next();
        });
        this.downloadFile = (file) => __awaiter(this, void 0, void 0, function* () {
            var _d;
            try {
                const tempDir = os_1.default.tmpdir();
                const downloadDir = path_1.default.join(tempDir, (_d = file === null || file === void 0 ? void 0 : file.split("_")) === null || _d === void 0 ? void 0 : _d.pop());
                const options = {
                    destination: downloadDir,
                };
                const bucketFile = this.bucket(bucketName).file(file);
                const [, metadata] = yield Promise.all([
                    bucketFile.download(options),
                    bucketFile.getMetadata(),
                ]);
                // Read the file content
                const fileContent = fs_1.default.readFileSync(downloadDir, "utf8");
                const json = JSON.parse(fileContent);
                // Delete the file
                fs_1.default.unlinkSync(downloadDir);
                return { json, metadata };
            }
            catch (error) {
                console.error("Error:", error);
                return {};
            }
        });
        this.uploadFile = (id, fileName, response) => __awaiter(this, void 0, void 0, function* () {
            try {
                const tempDir = os_1.default.tmpdir();
                // Read the file content
                fs_1.default.writeFileSync(`${tempDir}/${id}.json`, JSON.stringify(response, null, 2));
                yield this.bucket(bucketName).upload(`${tempDir}/${id}.json`, {
                    destination: fileName,
                    metadata: {
                        cacheControl: "no-store",
                        metadata: response === null || response === void 0 ? void 0 : response.reviewerData,
                    },
                });
                // Delete the file
                fs_1.default.unlinkSync(`${tempDir}/${id}.json`);
                return response === null || response === void 0 ? void 0 : response.reviewerData;
            }
            catch (error) {
                console.error("Error:", error);
                return false;
            }
        });
    }
}
exports.CodeSampleController = new RawCodeSampleController();
//# sourceMappingURL=code-edit-sample.controller.js.map