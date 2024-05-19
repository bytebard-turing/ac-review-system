"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirstReviewer = exports.isSecondReviewer = exports.isFinalReviewer = exports.wrapResultWithPermission = exports.getReviewPropMap = exports.getPropMap = exports.userAnnotatedInstructionFormatter = exports.userAnnotatedTextFormatter = exports.userAnnotatedStatusFormatter = exports.annotationStatusFormatter = exports.mapPayloadToObject = void 0;
const EEventType = {
    Edit: "edit",
    Completion: "completion",
};
const ECompletionFeedback = {
    POSITIVE: "POSITIVE",
    NEUTRAL: "NEUTRAL",
    NEGATIVE: "NEGATIVE",
};
/**
 * Retrieves the value of a nested property from a record using a dot-separated key path.
 *
 * @param {Object} record - The record to retrieve the value from.
 * @param {String} keyPath - The dot-separated key path to the property.
 * @returns {*} The value of the property, or an empty string if the property is not found.
 */
const getValueForKey = (record, keyPath) => {
    return keyPath
        .split(".")
        .reduce((acc, key) => (acc && typeof acc[key] !== "undefined" ? acc[key] : ""), record);
};
/**
 * Maps a feedback rating to a string representation.
 *
 * @param {String} rating - The feedback rating to map.
 * @returns {String} The string representation of the feedback rating.
 */
const getCompletionFeedback = (rating) => {
    return ({
        [ECompletionFeedback.POSITIVE]: "accepted",
        [ECompletionFeedback.NEGATIVE]: "rejected",
        [ECompletionFeedback.NEUTRAL]: "unsure",
    }[rating] || "unsure");
};
/**
 * Maps a payload object to an object using a mapper object.
 *
 * @param {Object} payload - The payload object to map.
 * @param {Object} mapper - The mapper object that defines the mapping.
 * @returns {Object} The mapped object.
 */
const mapPayloadToObject = (payload, mapper) => {
    return Object.entries(mapper).reduce((acc, [key, mapValue]) => {
        let value;
        if (typeof mapValue === "function") {
            value = mapValue(payload);
        }
        else {
            value = getValueForKey(payload, mapValue);
        }
        acc[key] = value;
        return acc;
    }, {});
};
exports.mapPayloadToObject = mapPayloadToObject;
/**
 * Formats the annotation status based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type.
 * @returns {String} The formatted annotation status.
 */
const annotationStatusFormatter = (payload) => {
    if (EEventType.Edit === payload.event_type) {
        return "change_prompt";
    }
    if (EEventType.Completion === payload.event_type) {
        return getCompletionFeedback(payload.feedback.rating);
    }
};
exports.annotationStatusFormatter = annotationStatusFormatter;
/**
 * Formats the user-annotated status based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type and feedback.
 * @returns {String} The formatted user-annotated status.
 */
const userAnnotatedStatusFormatter = (payload) => {
    if (EEventType.Edit === payload.event_type) {
        return payload.feedback.is_accepted ? "accepted" : "rejected";
    }
    if (EEventType.Completion === payload.event_type) {
        return getCompletionFeedback(payload.feedback.rating);
    }
};
exports.userAnnotatedStatusFormatter = userAnnotatedStatusFormatter;
/**
 * Formats the user-annotated text based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type and feedback.
 * @returns {String} The formatted user-annotated text.
 */
const userAnnotatedTextFormatter = (payload) => {
    if (EEventType.Edit === payload.event_type) {
        return payload.feedback.annotated_text;
    }
    if (EEventType.Completion === payload.event_type) {
        return payload.feedback.note;
    }
};
exports.userAnnotatedTextFormatter = userAnnotatedTextFormatter;
/**
 * Formats the user-annotated instruction based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type and feedback.
 * @returns {String} The formatted user-annotated instruction.
 */
const userAnnotatedInstructionFormatter = (payload) => {
    if (EEventType.Edit === payload.event_type) {
        return payload.feedback.annotated_instruction;
    }
    if (EEventType.Completion === payload.event_type) {
        return "";
    }
};
exports.userAnnotatedInstructionFormatter = userAnnotatedInstructionFormatter;
/**
 * Returns a map of properties for the payload.
 *
 * @returns {Object} A map of properties for the payload.
 */
const getPropMap = () => ({
    request_id: "request_id",
    user_id: "user_id",
    status: exports.annotationStatusFormatter,
    user_annotated_status: exports.userAnnotatedStatusFormatter,
    user_annotated_text: exports.userAnnotatedTextFormatter,
    user_annotated_instruction: exports.userAnnotatedInstructionFormatter,
    instruction: "request.instruction",
    path: "request.path",
    prefix_begin: "request.position.prefix_begin",
    suffix_end: "request.position.suffix_end",
    prefix: "request.prefix",
    selected_code: "request.selected_text",
    suffix: "request.suffix",
    file_count: "request.file_count",
    response: "response.text",
});
exports.getPropMap = getPropMap;
const getReviewPropMap = () => (Object.assign(Object.assign({}, (0, exports.getPropMap)()), { reviewerData: "reviewerData" }));
exports.getReviewPropMap = getReviewPropMap;
const wrapResultWithPermission = (response, user) => {
    var _a, _b, _c;
    const reviewerData = response.reviewerData || {};
    const canRead = ((_a = user.email) === null || _a === void 0 ? void 0 : _a.includes("turing.com")) || false;
    const canEdit = ((_b = user.email) === null || _b === void 0 ? void 0 : _b.includes(reviewerData.reviewerTwoAssignee)) ||
        ((_c = user.email) === null || _c === void 0 ? void 0 : _c.includes(reviewerData.finalReviewer));
    return Object.assign(Object.assign({}, response), { canEdit, canRead });
};
exports.wrapResultWithPermission = wrapResultWithPermission;
const isFinalReviewer = (email, reviewerData) => {
    return email === null || email === void 0 ? void 0 : email.includes(reviewerData.finalReviewer);
};
exports.isFinalReviewer = isFinalReviewer;
const isSecondReviewer = (email, reviewerData) => {
    return email === null || email === void 0 ? void 0 : email.includes(reviewerData.reviewerTwoAssignee);
};
exports.isSecondReviewer = isSecondReviewer;
const isFirstReviewer = (email, reviewerData) => {
    return email === null || email === void 0 ? void 0 : email.includes(reviewerData.reviewerOneAssignee);
};
exports.isFirstReviewer = isFirstReviewer;
//# sourceMappingURL=code-edit-sample.js.map