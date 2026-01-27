"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GHRepoResponseSchema = exports.GHPRResponseSchema = exports.GHCheckContextSchema = void 0;
var zod_1 = require("zod");
// Zod schemas for gh CLI output validation
exports.GHCheckContextSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    context: zod_1.z.string().optional(), // StatusContext uses 'context' instead of 'name'
    state: zod_1.z.enum(["SUCCESS", "FAILURE", "PENDING", "ERROR"]).optional(),
    status: zod_1.z.string().optional(), // CheckRun status: COMPLETED, IN_PROGRESS, etc.
    conclusion: zod_1.z
        .enum([
        "SUCCESS",
        "FAILURE",
        "CANCELLED",
        "SKIPPED",
        "TIMED_OUT",
        "ACTION_REQUIRED",
        "NEUTRAL",
        "", // Can be empty string when in progress
    ])
        .optional(),
    detailsUrl: zod_1.z.string().optional(),
    targetUrl: zod_1.z.string().optional(), // StatusContext uses 'targetUrl' instead of 'detailsUrl'
    startedAt: zod_1.z.string().optional(),
    completedAt: zod_1.z.string().optional(),
    workflowName: zod_1.z.string().optional(),
});
exports.GHPRResponseSchema = zod_1.z.object({
    number: zod_1.z.number(),
    title: zod_1.z.string(),
    url: zod_1.z.string(),
    state: zod_1.z.enum(["OPEN", "CLOSED", "MERGED"]),
    isDraft: zod_1.z.boolean(),
    mergedAt: zod_1.z.string().nullable(),
    additions: zod_1.z.number(),
    deletions: zod_1.z.number(),
    reviewDecision: zod_1.z
        .enum(["APPROVED", "CHANGES_REQUESTED", "REVIEW_REQUIRED", ""])
        .nullable(),
    // statusCheckRollup is an array directly, not { contexts: [...] }
    statusCheckRollup: zod_1.z.array(exports.GHCheckContextSchema).nullable(),
    // Mergeability status from GitHub
    mergeable: zod_1.z.enum(["MERGEABLE", "CONFLICTING", "UNKNOWN"]).optional(),
});
exports.GHRepoResponseSchema = zod_1.z.object({
    url: zod_1.z.string(),
});
