describe("영화 목록 조회 테스트", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173/");
    });

    it("초기 렌더링", () => {
        cy.get(".movie-list-title").should("have.text", "지금 인기 있는 영화");
        
        cy.get(".movie-list").should("exist");
        cy.get(".movie-list").children().should("have.length", 20);

        cy.get(".movie-list").children().each(($el) => {
            cy.wrap($el).find(".movie-poster").should("exist");
            cy.wrap($el).find(".movie-title").should("exist");
            cy.wrap($el).find(".movie-rate").should("exist");
        })
    })

    it("더보기 버튼 클릭 시 영화 목록 추가 조회", () => {
        cy.get(".load-more").click();
        cy.get(".movie-list").children().should("have.length", 40);

        cy.get(".load-more").click();
        cy.get(".movie-list").children().should("have.length", 60);
    })
})