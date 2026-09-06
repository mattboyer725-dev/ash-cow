export function operatorSecret() {
  return process.env.OPERATOR_SECRET?.trim() ?? "";
}

export function operatorLocked() {
  return operatorSecret().length > 0;
}

export function operatorAllowed(key?: string | null) {
  const secret = operatorSecret();
  if (!secret) return true;
  return typeof key === "string" && key.length > 0 && key === secret;
}
