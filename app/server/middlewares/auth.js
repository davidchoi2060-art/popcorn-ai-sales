export function resolveRequestIdentity(request) {
  return {
    authorization: request.headers.authorization || "",
    guestUid: request.headers["x-guest-uid"] || "",
    ip: request.socket?.remoteAddress || "",
  };
}
