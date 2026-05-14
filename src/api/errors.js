// API Error를 HTTP 요청-응답 흐름의 단계로 계층화 — 신뢰 누적 구조
// [1단계] TransportError — fetch 응답 수신 검사 실패 → Response 객체 부재
// [2단계] HttpError      — 1단계 통과 (Response 보장), HTTP status 검사 실패
// [3단계] DataError      — 2단계 통과 (success body 보장), 도메인 변환 검사 실패
class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = new.target.name;
    // babel-jest transpile 경로에서 super() 가 끊는 prototype chain 을 복원 → instanceof 보장.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class TransportError extends APIError {
  // 호출자가 abort 여부 판단해 boolean 으로 전달.
  // (native error.name 검사 같은 프로토콜 디테일은 http.js 영역)
  static toMatchingError(isAbort) {
    return isAbort ? new AbortError() : new NetworkError();
  }

  static is(error) {
    return error instanceof TransportError;
  }
}

class NetworkError extends TransportError {
  constructor() {
    super("network");
  }
}

class AbortError extends TransportError {
  constructor() {
    super("abort");
  }
}

class HttpError extends APIError {
  constructor(status, message) {
    super(message ?? `http ${status}`);
    this.status = status;
  }

  // 호출자가 status / Retry-After 헤더 추출해 프리미티브로 전달.
  // 정의 안 한 status (408 / 422 / 505 등) 는 부모 ClientError / ServerError 로 fallback.
  static toMatchingError(status, retryAfterHeader) {
    if (status === 400) return new BadRequestError();
    if (status === 401) return new UnauthorizedError();
    if (status === 403) return new ForbiddenError();
    if (status === 404) return new NotFoundError();
    if (status === 429) return new TooManyRequestsError(retryAfterHeader);
    if (status === 500) return new InternalServerError();
    if (status === 502) return new BadGatewayError();
    if (status === 503) return new ServiceUnavailableError(retryAfterHeader);
    if (status === 504) return new GatewayTimeoutError();
    if (status >= 500) return new ServerError(status);
    if (status >= 400) return new ClientError(status);
    // 도달 불가하나 방어용 (3xx 는 fetch 가 follow, 1xx 는 노출 안 됨)
    return new HttpError(status);
  }

  static is(error) {
    return error instanceof HttpError;
  }
}

class ClientError extends HttpError {}
class ServerError extends HttpError {}

class BadRequestError extends ClientError {
  constructor() {
    super(400);
  }
}

class UnauthorizedError extends ClientError {
  constructor() {
    super(401);
  }
}

class ForbiddenError extends ClientError {
  constructor() {
    super(403);
  }
}

class NotFoundError extends ClientError {
  constructor() {
    super(404);
  }
}

class TooManyRequestsError extends ClientError {
  // retryAfter: TMDB 가 429 응답에 실어 보낸 Retry-After 헤더 값.
  // 초 단위 정수면 number, HTTP-date 형식이면 string 그대로 보존. null/undefined 면 필드 자체 X.
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
  constructor(retryAfter) {
    super(429);
    if (retryAfter == null) return;
    const seconds = Number(retryAfter);
    this.retryAfter = Number.isFinite(seconds) ? seconds : retryAfter;
  }
}

class InternalServerError extends ServerError {
  constructor() {
    super(500);
  }
}

class BadGatewayError extends ServerError {
  constructor() {
    super(502);
  }
}

class ServiceUnavailableError extends ServerError {
  // retryAfter: 503 응답이 실어 보낼 수 있는 Retry-After 헤더 값. 보존 패턴은 429 와 동일.
  constructor(retryAfter) {
    super(503);
    if (retryAfter == null) return;
    const seconds = Number(retryAfter);
    this.retryAfter = Number.isFinite(seconds) ? seconds : retryAfter;
  }
}

class GatewayTimeoutError extends ServerError {
  constructor() {
    super(504);
  }
}

class DataError extends APIError {
  static is(error) {
    return error instanceof DataError;
  }
}

class ParseError extends DataError {
  constructor() {
    super("parse");
  }
}

class ValidationError extends DataError {
  constructor() {
    super("validation");
  }
}

export {
  APIError,
  TransportError,
  NetworkError,
  AbortError,
  HttpError,
  ClientError,
  ServerError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  InternalServerError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  DataError,
  ParseError,
  ValidationError,
};
