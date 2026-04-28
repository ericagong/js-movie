// 단계: 1 Transport (fetch 가 응답 받기 전 통신 단계 실패) / 2 Http (status 실패) / 3 Data (body 변환 실패).

class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = new.target.name;
    // babel-jest transpile 경로에서 super() 가 끊는 prototype chain 을 복원 → instanceof 보장.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// === 1단계: Transport — fetch 가 응답 받기 전 통신 단계 실패 ===
class TransportError extends AppError {}

function isTransportError(error) {
  return error instanceof TransportError;
}

// 네트워크 인프라 문제로 발생하는 모든 에러.
// 에러 발생 가능 시나리오: 오프라인 / DNS 실패 / CORS 차단 / SSL 오류 / 연결 거부 등
// 에러 처리 정책: 사용자에게 환경 점검 안내(인터넷 연결 확인).
class NetworkError extends TransportError {
  constructor() {
    super("network");
  }
}

// 정의: 클라이언트가 통신을 중단(AbortController.abort)한 경우 중 시간 정책에 의한 자동 중단.
// 시나리오: 모바일 약신호 / 서버가 응답 도중 멈춤 / 일시적 단절 / Captive Portal 통과 전.
// 정책: "응답이 느립니다, 재시도?" 안내. NetworkError 와 분리해 무응답을 "끊김" 으로 잘못 안내하지 않게 함.
class TimeoutAbortError extends TransportError {
  constructor() {
    super("timeout");
  }
}

// 정의: 클라이언트가 통신을 중단(AbortController.abort)한 경우 중 사용자 / 코드의 명시적 의도에 의한 중단.
// 시나리오: 더보기 연타 race 방어 / 페이지 이탈 / 자동완성 키입력마다 이전 요청 취소 / 컴포넌트 unmount.
// 정책: 의도된 취소이므로 사용자 가시 에러 UI 대상 아님 — 상태 머신에서 조용히 무시.
class IntentionalAbortError extends TransportError {
  constructor() {
    super("intentional");
  }
}

// === 2단계: Http — HTTP status 실패 ===
class HttpError extends AppError {
  constructor(status, message) {
    super(message ?? `http ${status}`);
    this.status = status;
  }
}

function isHttpError(error) {
  return error instanceof HttpError;
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
  // retryAfter: TMDB 가 429 응답에 실어 보낸 Retry-After 헤더 값(초 또는 HTTP-date).
  // step1 에선 사용 안 하나 향후 재시도 정책 도입 하게 된다면, 그대로 활용 위해 보존.
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
  constructor(retryAfter) {
    super(429);
    this.retryAfter = retryAfter;
  }
}

// 5xx 는 클라이언트가 502/503/504 를 객관적으로 구분할 정보가 없어 한 타입으로 통합.
// 5xx 상태 코드(502/503/504) 도 status 필드에 보존되어 로깅 시점 식별 가능.
class InternalServerError extends ServerError {
  constructor(status = 500) {
    super(status);
  }
}

// === 3단계: Data — body 를 도메인 데이터로 변환 실패 ===
class DataError extends AppError {}
function isDataError(error) {
  return error instanceof DataError;
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
  AppError,
  TransportError,
  isTransportError,
  NetworkError,
  TimeoutAbortError,
  IntentionalAbortError,
  HttpError,
  isHttpError,
  ClientError,
  ServerError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  InternalServerError,
  DataError,
  isDataError,
  ParseError,
  ValidationError,
};
