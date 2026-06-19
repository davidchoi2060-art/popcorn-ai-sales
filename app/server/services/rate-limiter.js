const buckets = new Map();

export function checkRateLimit({ guestUid, ip }) {
  const key = guestUid || ip || "anonymous";
  const today = new Date().toISOString().slice(0, 10);
  const bucketKey = `${today}:${key}`;
  const current = buckets.get(bucketKey) || 0;
  const limit = Number(process.env.RECOMMEND_DAILY_LIMIT || 50);

  if (current >= limit) {
    return {
      allowed: false,
      code: "RATE_LIMIT_EXCEEDED",
      message: "오늘 이용 한도를 초과했습니다.",
    };
  }

  buckets.set(bucketKey, current + 1);
  return { allowed: true };
}
