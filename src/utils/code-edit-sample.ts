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
    .reduce(
      (acc, key) => (acc && typeof acc[key] !== "undefined" ? acc[key] : ""),
      record
    );
};

/**
 * Maps a feedback rating to a string representation.
 *
 * @param {String} rating - The feedback rating to map.
 * @returns {String} The string representation of the feedback rating.
 */
const getCompletionFeedback = (rating) => {
  return (
    {
      [ECompletionFeedback.POSITIVE]: "accepted",
      [ECompletionFeedback.NEGATIVE]: "rejected",
      [ECompletionFeedback.NEUTRAL]: "unsure",
    }[rating] || "unsure"
  );
};

/**
 * Maps a payload object to an object using a mapper object.
 *
 * @param {Object} payload - The payload object to map.
 * @param {Object} mapper - The mapper object that defines the mapping.
 * @returns {Object} The mapped object.
 */
export const mapPayloadToObject = (payload, mapper) => {
  return Object.entries(mapper).reduce((acc, [key, mapValue]) => {
    let value;
    if (typeof mapValue === "function") {
      value = mapValue(payload);
    } else {
      value = getValueForKey(payload, mapValue);
    }
    acc[key] = value;
    return acc;
  }, {});
};

/**
 * Formats the annotation status based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type.
 * @returns {String} The formatted annotation status.
 */
export const annotationStatusFormatter = (payload) => {
  if (EEventType.Edit === payload.event_type) {
    return "change_prompt";
  }
  if (EEventType.Completion === payload.event_type) {
    return getCompletionFeedback(payload.feedback.rating);
  }
};

/**
 * Formats the user-annotated status based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type and feedback.
 * @returns {String} The formatted user-annotated status.
 */
export const userAnnotatedStatusFormatter = (payload) => {
  if (EEventType.Edit === payload.event_type) {
    return payload.feedback.is_accepted ? "accepted" : "rejected";
  }
  if (EEventType.Completion === payload.event_type) {
    return getCompletionFeedback(payload.feedback.rating);
  }
};

/**
 * Formats the user-annotated text based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type and feedback.
 * @returns {String} The formatted user-annotated text.
 */
export const userAnnotatedTextFormatter = (payload) => {
  if (EEventType.Edit === payload.event_type) {
    return payload.feedback.annotated_text;
  }
  if (EEventType.Completion === payload.event_type) {
    return payload.feedback.note;
  }
};

/**
 * Formats the user-annotated instruction based on the event type.
 *
 * @param {Object} payload - The payload object containing the event type and feedback.
 * @returns {String} The formatted user-annotated instruction.
 */
export const userAnnotatedInstructionFormatter = (payload) => {
  if (EEventType.Edit === payload.event_type) {
    return payload.feedback.annotated_instruction;
  }
  if (EEventType.Completion === payload.event_type) {
    return "";
  }
};

/**
 * Returns a map of properties for the payload.
 *
 * @returns {Object} A map of properties for the payload.
 */
export const getPropMap = () => ({
  request_id: "request_id",
  user_id: "user_id",
  status: annotationStatusFormatter,
  user_annotated_status: userAnnotatedStatusFormatter,
  user_annotated_text: userAnnotatedTextFormatter,
  user_annotated_instruction: userAnnotatedInstructionFormatter,
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

export const getReviewPropMap = () => ({
  ...getPropMap(),
  reviewerData: "reviewerData",
});

export const wrapResultWithPermission = (response: any, user: any) => {
  const reviewerData = response.reviewerData || {};
  const canRead = user.email?.includes("turing.com") || false;
  const canEdit =
    user.email?.includes(reviewerData.reviewerTwoAssignee) ||
    user.email?.includes(reviewerData.finalReviewer);
  return { ...response, canEdit, canRead };
};

export const isFinalReviewer = (email: string, reviewerData: any) => {
  return email?.includes(reviewerData?.finalReviewer);
};

export const isSecondReviewer = (email: string, reviewerData: any) => {
  return email?.includes(reviewerData?.reviewerTwoAssignee);
};

export const isFirstReviewer = (email: string, reviewerData: any) => {
  return email?.includes(reviewerData?.reviewerOneAssignee);
};

export const getReviewerMetadata = (reviewerData: any, email: string) => {
  if (!reviewerData) return {};
  const result = {
    level: 2,
    reviewStatus: "Pending",
    reviewComment: "",
    assignee: "",
    author: reviewerData.reviewerOneAssignee,
    authorComment: reviewerData.reviewerOneComment,
  };

  if (isFinalReviewer(email, reviewerData)) {
    return {
      ...result,
      level: 3,
      assignee: reviewerData.finalReviewer,
      reviewComment: reviewerData.finalReviewerComment,
      reviewStatus: reviewerData.finalReviewerStatus,
    };
  }
  if (isSecondReviewer(email, reviewerData)) {
    return {
      ...result,
      level: 2,
      assignee: reviewerData.reviewerTwoAssignee,
      reviewComment: reviewerData.reviewerTwoComment,
      reviewStatus: reviewerData.reviewerTwoStatus,
    };
  }
  return result;
};
