window.onload = function () {
    const bgMusic = document.getElementById("bg-music");
    bgMusic.play();
    bgMusic.volume = 0.2;
  };
  
  document.querySelector(".start-btn").addEventListener("click", function () {
    const bgMusic = document.getElementById("bg-music");
  bgMusic.volume = 0.5;
  bgMusic.play();
    window.location.href = "game.html";
  });
  
  document.querySelector(".about-btn").addEventListener("click", function () {
    window.location.href = "about.html";
  });
  
