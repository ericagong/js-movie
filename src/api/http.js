// 도메인 무관 HTTP 통신 — fetch / 타임아웃 / 응답 흐름만 담당.
//
// 메인 역할 = *normalize* — 외부 어휘 (native error / HTTP status) 를
// 우리 APIError 어휘로 통일해서 throw. Data 단계 (JSON / 스키마 검증) 와
// UX / 재시도 같은 처리는 이 파일 영역 밖.
//
// 분담:
// - 프로토콜 디테일 (native error.name 검사, status / 헤더 추출) → 이 파일
// - 우리 어휘 인스턴스화 → errors.js 의 toMatchingError factory

import { TransportError, HttpError } from "./errors.js";

// 클라이언트 정책 상 타임아웃
const DEFAULT_TIMEOUT = 3000;

// AbortSignal.timeout() 만료 시 native 는 name="TimeoutError",
// AbortController.abort() 시 native 는 name="AbortError" 로 마킹.
const isFetchAborted = (error) =>
  error?.name === "AbortError" || error?.name === "TimeoutError";

// 외부 공개 — Transport / HTTP 단계의 native / status 를 우리 어휘로 normalize 해서 throw.
// Data 단계 (JSON 파싱 / 스키마 검증) 는 도메인 호출자 (tmdb.js) 의 몫.
async function request(url) {
  let response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT),
    });
  } catch (error) {
    throw TransportError.toMatchingError(isFetchAborted(error));
  }

  if (!response.ok) {
    throw HttpError.toMatchingError(
      response.status,
      response.headers.get("Retry-After"),
    );
  }

  return response;
}

export { request };
