"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSampleRouter = void 0;
const code_edit_sample_controller_1 = require("./code-edit-sample.controller");
const CodeSampleRouter = (router) => {
    router.get("/api/code-samples", code_edit_sample_controller_1.CodeSampleController.getFiles);
    router.post("/api/code-samples/view", code_edit_sample_controller_1.CodeSampleController.getFile);
    router.post("/api/code-samples/save", code_edit_sample_controller_1.CodeSampleController.saveReview);
};
exports.CodeSampleRouter = CodeSampleRouter;
//# sourceMappingURL=code-edit-sample.route.js.map