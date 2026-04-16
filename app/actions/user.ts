"use server";

import { createClient } from "@/app/lib/supabase/server";
import { log } from "@/app/lib/logger";
import type { UserSettings } from "@/app/models/user";
import { User } from "@supabase/auth-js";
import { z } from "zod";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

// ---------------------------------------------------------------------------
// API-key encryption helpers (AES-256-GCM)
// ---------------------------------------------------------------------------
// The encryption key is derived by SHA-256 hashing SUPABASE_ACCESS_TOKEN so
// it is always exactly 32 bytes regardless of token length.
// Stored format: <iv_hex>:<authTag_hex>:<ciphertext_hex>
// ---------------------------------------------------------------------------

function getEncryptionKey(): Buffer {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "SUPABASE_ACCESS_TOKEN env var is not set — cannot encrypt api_key",
    );
  }
  return createHash("sha256").update(token).digest();
}

function encryptApiKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptApiKey(stored: string): string {
  const parts = stored.split(":");
  if (parts.length !== 3) {
    // Not in our encrypted format — return as-is (migration safety for
    // any plaintext values that existed before encryption was introduced).
    return stored;
  }
  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  return (
    decipher.update(Buffer.from(ciphertextHex, "hex")).toString("utf8") +
    decipher.final("utf8")
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUserId(userId: unknown): userId is string {
  return typeof userId === "string" && UUID_RE.test(userId);
}

function prepareSettings(object: Partial<UserSettings>) {
  if (!object) {
    return {};
  }

  if ("user_id" in object) {
    delete object.user_id;
  }

  if ("created_at" in object) {
    delete object.created_at;
  }

  if ("updated_at" in object) {
    delete object.updated_at;
  }

  return object;
}

const userSettingsUpdateSchema = z
  .object({
    project_id: z.string(),
    issue_query: z.string(),
    content_template: z.string(),
    ticket_item_template: z.string(),
    mail_recipient: z.string(),
    mail_subject: z.string(),
    mail_author: z.string(),
    assignee: z.string(),
    username: z.string(),
    is_using_master_key: z.boolean(),
    api_key: z.string(),
    assignee_is_current_user: z.boolean(),
  })
  .partial()
  .strict();

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
    log.warn("jira", "buildJiraAuth: no settings row", {
      userId: user.id,
    });
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

    const settings = data as UserSettings;

    // Decrypt the api_key if present so callers always receive plaintext.
    if (settings.api_key) {
      try {
        settings.api_key = decryptApiKey(settings.api_key);
      } catch (err) {
        log.error("db", "getUserSettings: api_key decryption failed", {
          userId,
          message: err instanceof Error ? err.message : String(err),
        });
        settings.api_key = "";
      }
    }

    return settings;
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
  userSettings: Partial<Omit<UserSettings, "user_id" | "updated_at">>,
): Promise<UserSettings | null> {
  const settings = prepareSettings(userSettings);

  if (!isValidUserId(userId)) {
    log.warn("db", "updateUserSettings: invalid userId", {
      userId: String(userId),
    });
    return null;
  }

  const parsed = userSettingsUpdateSchema.safeParse(settings);
  if (!parsed.success) {
    log.warn("db", "updateUserSettings: invalid settings payload", {
      userId,
      errors: JSON.stringify(parsed.error.flatten()),
    });
    return null;
  }

  const fields = Object.keys(parsed.data);
  if (fields.length === 0) {
    log.warn(
      "db",
      "updateUserSettings: empty payload, nothing to update",
      {
        userId,
      },
    );
    return null;
  }

  // Authorization check: a logged-in user can only modify their own row.
  // RLS already enforces this in Postgres, but failing fast here gives a
  // clearer log line and avoids a needless round-trip.
  const current = await getCurrentUser();
  if (!current) {
    log.warn("db", "updateUserSettings: no authenticated user", {
      userId,
    });
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

  // Encrypt the api_key before persisting so it is never stored in plaintext.
  // An empty string means "clear the key" — store it as-is rather than
  // encrypting a blank value.
  const payload: typeof parsed.data = { ...parsed.data };
  if ("api_key" in payload && payload.api_key) {
    try {
      payload.api_key = encryptApiKey(payload.api_key);
    } catch (err) {
      log.error("db", "updateUserSettings: api_key encryption failed", {
        userId,
        message: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        ...payload,
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
