<p align="middle" >
  <img width="200" src="https://nextstep-storage.s3.ap-northeast-2.amazonaws.com/55617d4fd3b4439fb7fd594fd715c4f4">
</p>
<h2 align="middle">영화 리뷰</h2>
<p align="middle">비동기 통신을 이용하여 웹 API 요청하기</p>
<p align="middle">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="template version"/>
  <img src="https://img.shields.io/badge/language-html-red.svg?style=flat-square"/>
  <img src="https://img.shields.io/badge/language-css-blue.svg?style=flat-square"/>
  <img src="https://img.shields.io/badge/language-js-yellow.svg?style=flat-square"/>
  <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square"/>
</p>

## 🔥 Projects!

<p align="middle">
  <img width="400" src="https://nextstep-storage.s3.ap-northeast-2.amazonaws.com/ad8287dcbe5343b4942dc0c8820b7923">

</p>

<br>

## 🚀 시작하기

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 VITE_API_KEY 값을 발급받은 TMDB API 키로 교체

# 3. 개발 서버 실행
pnpm dev
```

TMDB API 키는 [TMDB API 설정 페이지](https://www.themoviedb.org/settings/api)에서 발급받을 수 있습니다. `.env` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

<br>

## API 실패 레이어 분류

| 단계(요청→전송→응답→해석) | 쉬운 분류 | 예시 상황 | fetch에서 보이는 형태(대표) | 클라이언트 권장 에러 메시지(예시) | 재시도 정책(권장) |
|---|---|---|---|---|---|
| 요청 시도 | 요청 만들기 실패(클라이언트 설정/코드) | URL 잘못됨, baseURL/env 누락, 잘못된 파라미터 조합 | 보통 Promise reject(TypeError) 또는 호출 직후 예외(환경에 따라) | 요청을 준비하는 중 문제가 발생했어요. | 재시도 X(개발/설정 이슈). 새로고침 정도만 |
| 전송 | 브라우저가 차단함 | CORS/CSP/Mixed Content, 확장프로그램 차단 | Promise reject(TypeError) (대개 `Failed to fetch`류, status 없음) | 브라우저에서 연결을 차단했어요. 네트워크/보안 설정을 확인해 주세요. | 재시도 △(대부분 무의미). 자동 재시도는 비권장 |
| 전송 | 네트워크 실패(오프라인/연결문제) | 오프라인, DNS 실패, TLS 문제, 연결 끊김, 프록시/포털 | Promise reject(TypeError) (`Failed to fetch` / `NetworkError...` 등) | 인터넷 연결이 불안정해요. 연결을 확인하고 다시 시도해 주세요. | 재시도 O(사용자 버튼 + 필요 시 자동 1~2회, 짧은 백오프) |
| 전송 | 타임아웃(클라이언트에서 끊음) | 제한시간 초과 → AbortController로 abort | Promise reject(DOMException: AbortError) | 응답이 지연되고 있어요. 다시 시도해 주세요. | 재시도 O(백오프 권장). 연타 방지 필요 |
| 응답 | HTTP 오류 응답(상태코드) | 401/403/404/429/5xx 등 | fetch는 resolve(Response). `response.ok===false`, `response.status`로 분기 | 아래 상태코드별 메시지 참고 | 아래 상태코드별 정책 참고 |
| 응답 | 401 인증 필요 | 토큰 만료/로그인 필요 | resolve(Response) + `status===401` | 로그인이 필요해요. 다시 로그인해 주세요. | 재시도 △(토큰 갱신 성공 시 1회 자동 재요청, 아니면 로그인 후 재시도) |
| 응답 | 403 권한 없음 | 권한/지역/플랜 제한 | resolve(Response) + `status===403` | 이 기능에 접근 권한이 없어요. | 재시도 X |
| 응답 | 404/410 없음 | 엔드포인트/리소스 없음 | resolve(Response) + `status===404/410` | 요청한 정보를 찾을 수 없어요. | 재시도 X(새로고침/홈 이동 정도) |
| 응답 | 429 요청 제한 | rate limit | resolve(Response) + `status===429` | 요청이 많아요. 잠시 후 다시 시도해 주세요. | 재시도 O(`Retry-After` 존중, 없으면 백오프) |
| 응답 | 5xx 서버 문제 | 500/502/503/504 | resolve(Response) + `status>=500` | 서버에 문제가 있어요. 잠시 후 다시 시도해 주세요. | 재시도 O(백오프, 연타 방지) |
| 응답 | 3xx 리다이렉트(특수) | 301/302/307/308/304 등 | 기본 `redirect:"follow"`면 보통 최종 응답만 관측. 직접 보면 `status===3xx`, `response.redirected` 참고 | 요청이 다른 곳으로 이동되었어요. | 재시도 X(대부분 설정/인증 흐름 점검 필요) |
| 해석 | 파싱 실패(2xx인데 JSON이 아님/깨짐) | 200인데 HTML/빈문자열/깨진 JSON | `await response.json()`에서 Promise reject(SyntaxError) | 데이터를 불러오지 못했어요. 다시 시도해 주세요. | 재시도 △/O(일시 오류면 1~2회, 반복 실패 시 중단) |
| 해석 | 내용 구조가 다름(스키마 불일치) | 필드 누락/타입 변경 | fetch 에러 없음. 클라이언트 검증(zod 등) 실패 또는 UI 런타임 오류 | 데이터 형식이 예상과 달라 표시할 수 없어요. | 재시도 X(계약/배포 불일치 가능). 새로고침 + 로깅/리포트 |
| 해석 | 200이지만 의미적으로 실패(도메인 실패) | `{success:false, errorCode}` / GraphQL `errors` 등 | fetch 에러 없음. 응답 바디를 보고 클라이언트가 실패로 판정 | 요청을 처리할 수 없어요. (가능하면 사유 안내) | 케이스별(일시적 코드면 O, 정책/권한/조건이면 X) |