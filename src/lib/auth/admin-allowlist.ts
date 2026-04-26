function parseAdminEmails(raw: string): readonly string[] {
  const unique = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return Object.freeze([...unique]);
}

let cachedRaw = "";
let cachedEmails: readonly string[] = Object.freeze([] as string[]);
let cachedEmailSet: ReadonlySet<string> = new Set<string>();

function refreshAdminCache() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  if (raw === cachedRaw) return;
  cachedRaw = raw;
  cachedEmails = parseAdminEmails(raw);
  cachedEmailSet = new Set(cachedEmails);
}

export function getAdminEmails(): readonly string[] {
  refreshAdminCache();
  return cachedEmails;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  refreshAdminCache();
  return cachedEmailSet.has(email.trim().toLowerCase());
}
