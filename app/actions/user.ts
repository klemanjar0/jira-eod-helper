"use server";

import { createClient } from "@/app/lib/supabase/server";
import { log } from "@/app/lib/logger";
import type { UserSettings } from "@/app/models/user";
import { User } from "@supabase/auth-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUserId(userId: unknown): userId is string {
  return typeof userId === "string" && UUID_RE.test(userId);
}

/**
 * Builds a Jira Basic auth header for the current user.
 *
 * Jira Cloud expects `Authorization: Basic base64(email:apiToken)`.
 * Reads the authed user and their settings; if `is_using_master_key`
 * is enabled and `MASTER_EMAIL` + `MASTER_API_TOKEN` env vars are set,
 * those are used instead of the user's personal credentials.
 *
 * Returns `null` if the user isn't signed in, has no settings row,
 * or is missing required credentials.
 */
export async function buildJiraAuth(): Promise<string | null> {
  log.debug("jira", "buildJiraAuth: start");

  const user = await getCurrentUser();
  if (!user) {
    log.warn("jira", "buildJiraAuth: no authenticated user");
    return null;
  }

  const settings = await getUserSettings(user.id);
  if (!settings) {
    log.warn("jira", "buildJiraAuth: no settings row", { userId: user.id });
    return null;
  }

  const masterEmail = process.env.MASTER_EMAIL;
  const masterToken = process.env.MASTER_API_TOKEN;
  const wantsMaster = settings.is_using_master_key;
  const masterAvailable = !!masterEmail && !!masterToken;

  if (wantsMaster && !masterAvailable) {
    log.warn(
      "jira",
      "buildJiraAuth: master mode enabled but env vars missing",
      {
        userId: user.id,
        hasMasterEmail: !!masterEmail,
        hasMasterToken: !!masterToken,
      },
    );
  }

  const useMaster = wantsMaster && masterAvailable;
  const email = useMaster ? masterEmail! : user.email;
  const apiToken = useMaster ? masterToken! : settings.api_key;

  if (!email || !apiToken) {
    log.warn("jira", "buildJiraAuth: missing credentials", {
      userId: user.id,
      useMaster,
      hasEmail: !!email,
      hasToken: !!apiToken,
    });
    return null;
  }

  const encoded = Buffer.from(`${email}:${apiToken}`).toString("base64");
  log.debug("jira", "buildJiraAuth: ok", {
    userId: user.id,
    useMaster,
    emailHost: email.split("@")[1] ?? "?",
  });
  return `Basic ${encoded}`;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      log.warn("auth", "getCurrentUser: supabase error", {
        code: error.code,
        message: error.message,
      });
      return null;
    }

    if (!user) {
      log.debug("auth", "getCurrentUser: no session");
      return null;
    }

    log.debug("auth", "getCurrentUser: ok", { userId: user.id });
    return user;
  } catch (err) {
    log.error("auth", "getCurrentUser: unexpected exception", {
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function getUserSettings(
  userId: string,
): Promise<UserSettings | null> {
  if (!isValidUserId(userId)) {
    log.warn("db", "getUserSettings: invalid userId", {
      userId: String(userId),
    });
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      log.warn("db", "getUserSettings: not found or error", {
        userId,
        code: error.code,
        message: error.message,
      });
      return null;
    }

    if (!data) {
      log.warn("db", "getUserSettings: empty row", { userId });
      return null;
    }

    log.debug("db", "getUserSettings: ok", { userId });
    return data as UserSettings;
  } catch (err) {
    log.error("db", "getUserSettings: unexpected exception", {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, "user_id" | "updated_at">>,
): Promise<UserSettings | null> {
  if (!isValidUserId(userId)) {
    log.warn("db", "updateUserSettings: invalid userId", {
      userId: String(userId),
    });
    return null;
  }

  if (!settings || typeof settings !== "object") {
    log.warn("db", "updateUserSettings: settings payload is not an object", {
      userId,
      type: typeof settings,
    });
    return null;
  }

  const fields = Object.keys(settings);
  if (fields.length === 0) {
    log.warn("db", "updateUserSettings: empty payload, nothing to update", {
      userId,
    });
    return null;
  }

  // Authorization check: a logged-in user can only modify their own row.
  // RLS already enforces this in Postgres, but failing fast here gives a
  // clearer log line and avoids a needless round-trip.
  const current = await getCurrentUser();
  if (!current) {
    log.warn("db", "updateUserSettings: no authenticated user", { userId });
    return null;
  }
  if (current.id !== userId) {
    log.error("db", "updateUserSettings: user/payload mismatch", {
      authedUserId: current.id,
      payloadUserId: userId,
    });
    return null;
  }

  log.debug("db", "updateUserSettings: start", { userId, fields });

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      log.error("db", "updateUserSettings failed", {
        userId,
        code: error.code,
        message: error.message,
        fields,
      });
      return null;
    }

    log.info("db", "updateUserSettings: ok", { userId, fields });
    return data as UserSettings;
  } catch (err) {
    log.error("db", "updateUserSettings: unexpected exception", {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
