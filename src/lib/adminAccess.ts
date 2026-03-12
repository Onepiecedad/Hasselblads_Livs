function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const configuredAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map(normalizeEmail)
  .filter(Boolean);

const adminEmailSet = new Set(configuredAdminEmails);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmailSet.has(normalizeEmail(email));
}

export function getConfiguredAdminEmails(): string[] {
  return [...adminEmailSet];
}
