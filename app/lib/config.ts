/** Public config — available in both server and client code */
export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
} as const;

/** Server-only config — never exposed to the browser */
export function getServerConfig() {
  if (typeof window !== "undefined") {
    throw new Error("getServerConfig() called on the client");
  }
  return {
    jiraHost: process.env.NEXT_PUBLIC_JIRA_HOST!,
    masterEmail: process.env.MASTER_EMAIL!,
    masterApiToken: process.env.MASTER_API_TOKEN!,
  } as const;
}
