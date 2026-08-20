/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as auth from "../auth.js";
import type * as carTypes from "../carTypes.js";
import type * as contact from "../contact.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as payments from "../payments.js";
import type * as payments_actions from "../payments_actions.js";
import type * as push from "../push.js";
import type * as reports from "../reports.js";
import type * as reviews from "../reviews.js";
import type * as rides from "../rides.js";
import type * as sanitize from "../sanitize.js";
import type * as settings from "../settings.js";
import type * as stats from "../stats.js";
import type * as stripe_webhook from "../stripe_webhook.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  auth: typeof auth;
  carTypes: typeof carTypes;
  contact: typeof contact;
  emails: typeof emails;
  http: typeof http;
  migrations: typeof migrations;
  notifications: typeof notifications;
  payments: typeof payments;
  payments_actions: typeof payments_actions;
  push: typeof push;
  reports: typeof reports;
  reviews: typeof reviews;
  rides: typeof rides;
  sanitize: typeof sanitize;
  settings: typeof settings;
  stats: typeof stats;
  stripe_webhook: typeof stripe_webhook;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
