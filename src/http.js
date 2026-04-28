// 도메인 무관 HTTP 통신 — fetch / 타임아웃 / status 분류 책임만 담당.
// TMDB endpoint 어휘는 tmdb.js, 도메인 변환은 services 의 책임.

import {
  NetworkError,
  TimeoutAbortError,
  HttpError,
  ClientError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  InternalServerError,
} from "./errors.js";

// 클라이언트 정책 상 타임아웃 에러
const DEFAULT_TIMEOUT = 3000;

async function fetchWithTimeout(url, timeoutMs = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    // 이 함수의 abort 출처는 setTimeout 한 곳뿐 → AbortError 는 항상 timeout.
    if (error?.name === "AbortError") throw new TimeoutAbortError();
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }
}

function throwMatchingHttpError(response) {
  const {status} = response;
  if (status === 400) throw new BadRequestError();
  if (status === 401) throw new UnauthorizedError();
  if (status === 403) throw new ForbiddenError();
  if (status === 404) throw new NotFoundError();
  if (status === 429) {
    const header = response.headers.get("Retry-After");
    const seconds = header != null ? Number(header) : undefined;
    throw new TooManyRequestsError(Number.isFinite(seconds) ? seconds : header);
  }
  if (status >= 500) throw new InternalServerError(status);
  // 정의되지 않은 4xx (422 / 451 등) — silent pass 방지
  if (status >= 400) throw new ClientError(status);
  // 도달 불가하나 방어용 (3xx 는 fetch 가 follow, 1xx 는 노출 안 됨)
  throw new HttpError(status);
}


async function httpRequest(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throwMatchingHttpError(response);
  return response.json();
}

export { fetchWithTimeout, throwMatchingHttpError, httpRequest };
