import image from "../templates/images/star_filled.png";

console.log("npm run dev 명령어를 통해 영화 리뷰 미션을 시작하세요");

addEventListener("load", () => {
  const app = document.querySelector("#app");
  const buttonImage = document.createElement("img");
  buttonImage.src = image;

  if (app) {
    app.appendChild(buttonImage);
  }
});
