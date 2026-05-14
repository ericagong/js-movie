// 우리 에러 어휘 → 사용자 메시지 어휘 매핑.
// 처리는 클라이언트 개발자의 몫 — 이 파일이 *이 앱의* UX 정책.
// cypress e2e 가 검증 중인 문구를 그대로 보존.

import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  ServerError,
  ClientError,
  AbortError,
  NetworkError,
  DataError,
} from "../api/errors.js";

function toUserMessage(error) {
  if (error instanceof BadRequestError) return "잘못된 요청입니다.";
  if (error instanceof UnauthorizedError) return "인증되지 않은 사용자입니다.";
  if (error instanceof ForbiddenError) return "접근 권한이 없습니다.";
  if (error instanceof NotFoundError) return "요청한 자원을 찾을 수 없습니다.";
  if (error instanceof TooManyRequestsError)
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
  if (error instanceof ServerError) return "서버 오류가 발생했습니다.";
  if (error instanceof ClientError) return "요청 처리에 실패했습니다.";
  if (error instanceof AbortError) return "서버 응답이 지연되고 있습니다.";
  if (error instanceof NetworkError) return "네트워크 오류가 발생했습니다.";
  if (error instanceof DataError) return "응답 형식 오류가 발생했습니다.";
  return "알 수 없는 오류가 발생했습니다.";
}

export { toUserMessage };
