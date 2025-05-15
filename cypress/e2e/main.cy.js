const POPULAR_MOVIES_URL = "https://api.themoviedb.org/3/movie/popular";
const getPopularMoviesUrl = (page) => {
    return "https://api.themoviedb.org/3/movie/popular?" +
        new URLSearchParams({
            api_key: Cypress.env("API_KEY"), // cypress.env.json
            language: "ko-KR",
            page: page,
        });
}

describe("메인 페이지 영화 목록 조회 시나리오 테스트", () => {
    beforeEach(() => {
        cy.intercept("GET", getPopularMoviesUrl(1), { fixture: "initial-movies.json" }).as("initialMovies");
        cy.visit("http://localhost:5173/");
    });

    it("페이지 진입 시, 섹션 제목과 영화 카드 20개, 더보기 버튼이 나타난다.", () => {
        cy.get("#popular-movies-title").should("have.text", "지금 인기 있는 영화");

        cy.get(".movie-card-view").should("exist");
        
        cy.wait("@initialMovies");
        cy.get(".movie-card-view").children().should("have.length", 20);
        cy.get(".movie-card-view").children().each(($el) => {
            cy.wrap($el).find(".poster").should("exist");
            cy.wrap($el).find(".title").should("exist");
            cy.wrap($el).find(".rate").should("exist");
        })

        cy.get("#load-more-movies").should("exist");
        cy.get("#load-more-movies").should("have.text", "더보기");
    })

    describe('더보기 버튼 클릭시', () => {
        it("마지막 페이지가 아니라면, 영화 카드가 20개 추가되고, 더보기 버튼이 나타난다.", () => {
            cy.intercept("GET", getPopularMoviesUrl(2), { fixture: "more-movies.json" }).as("moreMovies");
            cy.get("#load-more-movies").click();
            cy.wait("@moreMovies");

            cy.get(".movie-card-view").children().should("have.length", 40);
            cy.get("#load-more-movies").should("have.attr", "data-page", "2");

            cy.get("#load-more-movies").should("exist");
        })

        it("마지막 페이지라면, 영화 카드가 20개 이하로 추가되고, 더보기 버튼이 사라진다.", () => {
            cy.intercept("GET", getPopularMoviesUrl(2), { fixture: "last-movies.json" }).as("lastMovies");
            cy.get("#load-more-movies").click();
            cy.wait("@lastMovies");

            cy.get(".movie-card-view").children().should("have.length", 40);
            cy.get("#load-more-movies").should("have.attr", "data-page", "null");

            cy.get("#load-more-movies").should("not.visible");
        })
    })
})