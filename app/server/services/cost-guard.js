export function checkCostGuard() {
  if (process.env.COST_CIRCUIT_OPEN === "true") {
    return {
      allowed: false,
      code: "COST_CIRCUIT_OPEN",
      message: "현재 비용 보호 회로가 활성화되어 있습니다.",
    };
  }

  return { allowed: true };
}
