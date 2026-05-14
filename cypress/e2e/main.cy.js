// 인기 영화 endpoint intercept — page 별 fixture 분기.
// url + query 단위 매칭이라 api_key / language 등 다른 쿼리 파라미터는 무관.
const popularMoviesIntercept = (page) => ({
  method: "GET",
  url: "**/movie/popular*",
  query: { page: String(page) },
});

describe("메인 페이지 영화 목록 조회 시나리오 테스트", () => {
  beforeEach(() => {
    cy.intercept(popularMoviesIntercept(1), {
      fixture: "initial-movies.json",
    }).as("initialMovies");
    cy.visit("http://localhost:5173/");
  });

  it("페이지 진입 시, 섹션 제목과 영화 카드 20개, 더보기 버튼이 나타난다.", () => {
    cy.get("#popular-movies-title").should("have.text", "지금 인기 있는 영화");

    cy.get(".movie-card-view").should("exist");

    cy.wait("@initialMovies");
    cy.get(".movie-card-view").children().should("have.length", 20);
    cy.get(".movie-card-view")
      .children()
      .each(($el) => {
        cy.wrap($el).find(".poster").should("exist");
        cy.wrap($el).find(".title").should("exist");
        cy.wrap($el).find(".rate").should("exist");
      });

    cy.get("#load-more-movies").should("exist");
    cy.get("#load-more-movies").should("have.text", "더보기");
  });

  describe("더보기 버튼 클릭시", () => {
    it("마지막 페이지가 아니라면, 영화 카드가 20개 추가되고, 더보기 버튼이 나타난다.", () => {
      cy.intercept(popularMoviesIntercept(2), {
        fixture: "more-movies.json",
      }).as("moreMovies");
      cy.get("#load-more-movies").click();
      cy.wait("@moreMovies");

      cy.get(".movie-card-view").children().should("have.length", 40);
      cy.get("#load-more-movies").should("have.attr", "data-page", "2");

      cy.get("#load-more-movies").should("exist");
    });

    it("마지막 페이지라면, 영화 카드가 20개 이하로 추가되고, 더보기 버튼이 사라진다.", () => {
      cy.intercept(popularMoviesIntercept(2), {
        fixture: "last-movies.json",
      }).as("lastMovies");
      cy.get("#load-more-movies").click();
      cy.wait("@lastMovies");

      cy.get(".movie-card-view").children().should("have.length", 40);
      cy.get("#load-more-movies").should("have.attr", "data-page", "null");

      cy.get("#load-more-movies").should("not.visible");
    });
  });
});

describe("API 통신 과정 오류 테스트", () => {
  describe("[1단계] Transport — 응답 받기 전 통신 실패", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173/");
    });

    it("네트워크 끊김 시, '네트워크 오류가 발생했습니다.' 메시지가 나타난다.", () => {
      cy.intercept(popularMoviesIntercept(1), {
        forceNetworkError: true,
      }).as("networkError");
      cy.reload();
      cy.wait("@networkError");

      cy.contains("네트워크 오류가 발생했습니다.").should("exist");
    });

    it(
      "서버 응답 지연 시, '서버 응답이 지연되고 있습니다.' 메시지가 나타난다.",
      {
        defaultCommandTimeout: 6000, // 6초로 늘리기
      },
      () => {
        cy.intercept(popularMoviesIntercept(1), () => {
          return new Promise(() => {}); // 응답 안 줘서 Abort 유도
        }).as("delayedResponse");

        cy.visit("http://localhost:5173");

        cy.contains("서버 응답이 지연되고 있습니다.").should("exist");
      },
    );
  });

  describe("[2단계] Http — status 실패", () => {
    describe("4xx Client", () => {
      beforeEach(() => {
        cy.visit("http://localhost:5173/");
      });

      it("400 Bad Request 오류 시, '잘못된 요청입니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 400,
          body: { message: "Bad Request" },
        }).as("badRequest");
        cy.reload();
        cy.wait("@badRequest");

        cy.contains("잘못된 요청입니다.").should("exist");
      });

      it("401 Unauthorized 오류 시, '인증되지 않은 사용자입니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 401,
          body: { message: "Unauthorized" },
        }).as("unauthorized");
        cy.reload();
        cy.wait("@unauthorized");

        cy.contains("인증되지 않은 사용자입니다.").should("exist");
      });

      it("403 Forbidden 오류 시, '접근 권한이 없습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 403,
          body: { message: "Forbidden" },
        }).as("forbidden");
        cy.reload();
        cy.wait("@forbidden");

        cy.contains("접근 권한이 없습니다.").should("exist");
      });

      it("404 Not Found 오류 시, '요청한 자원을 찾을 수 없습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 404,
          body: { message: "Not Found" },
        }).as("notFound");
        cy.reload();
        cy.wait("@notFound");

        cy.contains("요청한 자원을 찾을 수 없습니다.").should("exist");
      });

      it("429 Too Many Requests 오류 시, '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 429,
          headers: { "Retry-After": "60" },
          body: { message: "Too Many Requests" },
        }).as("tooManyRequests");
        cy.reload();
        cy.wait("@tooManyRequests");

        cy.contains("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.").should(
          "exist",
        );
      });

      it("정의 안 한 4xx (예: 408 Request Timeout) 시, '요청 처리에 실패했습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 408,
          body: { message: "Request Timeout" },
        }).as("clientErrorFallback");
        cy.reload();
        cy.wait("@clientErrorFallback");

        cy.contains("요청 처리에 실패했습니다.").should("exist");
      });
    });

    describe("5xx Server", () => {
      beforeEach(() => {
        cy.visit("http://localhost:5173/");
      });

      it("500 Internal Server Error 오류 시, '서버 오류가 발생했습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 500,
          body: { message: "Internal Server Error" },
        }).as("internalServerError");
        cy.reload();
        cy.wait("@internalServerError");

        cy.contains("서버 오류가 발생했습니다.").should("exist");
      });

      it("502 Bad Gateway 오류 시, '서버 오류가 발생했습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 502,
          body: { message: "Bad Gateway" },
        }).as("badGateway");
        cy.reload();
        cy.wait("@badGateway");

        cy.contains("서버 오류가 발생했습니다.").should("exist");
      });

      it("503 Service Unavailable 오류 시, '서버 오류가 발생했습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 503,
          headers: { "Retry-After": "120" },
          body: { message: "Service Unavailable" },
        }).as("serviceUnavailable");
        cy.reload();
        cy.wait("@serviceUnavailable");

        cy.contains("서버 오류가 발생했습니다.").should("exist");
      });

      it("504 Gateway Timeout 오류 시, '서버 오류가 발생했습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 504,
          body: { message: "Gateway Timeout" },
        }).as("gatewayTimeout");
        cy.reload();
        cy.wait("@gatewayTimeout");

        cy.contains("서버 오류가 발생했습니다.").should("exist");
      });

      it("정의 안 한 5xx (예: 505 HTTP Version Not Supported) 시, '서버 오류가 발생했습니다.' 메시지가 나타난다.", () => {
        cy.intercept(popularMoviesIntercept(1), {
          statusCode: 505,
          body: { message: "HTTP Version Not Supported" },
        }).as("serverErrorFallback");
        cy.reload();
        cy.wait("@serverErrorFallback");

        cy.contains("서버 오류가 발생했습니다.").should("exist");
      });
    });
  });

  describe("[3단계] Data — body 변환 실패", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173/");
    });

    it("비-JSON body 응답 시, '응답 형식 오류가 발생했습니다.' 메시지가 나타난다.", () => {
      cy.intercept(popularMoviesIntercept(1), {
        statusCode: 200,
        body: "<html>not a json</html>", // response.json() 이 SyntaxError → ParseError
      }).as("parseError");
      cy.reload();
      cy.wait("@parseError");

      cy.contains("응답 형식 오류가 발생했습니다.").should("exist");
    });

    it("응답 스키마 불일치 시, '응답 형식 오류가 발생했습니다.' 메시지가 나타난다.", () => {
      cy.intercept(popularMoviesIntercept(1), {
        statusCode: 200,
        body: {
          page: 1,
          total_pages: 10,
          results: [{ id: 1 }], // title / poster_path / vote_average 누락 → ValidationError
        },
      }).as("validationError");
      cy.reload();
      cy.wait("@validationError");

      cy.contains("응답 형식 오류가 발생했습니다.").should("exist");
    });
  });
});
