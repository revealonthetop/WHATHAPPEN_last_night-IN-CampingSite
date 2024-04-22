//  캐릭터 생성 클래스

class Character {
    constructor(x, y, speed, color) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.color = color;
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, 20, 20); // Example size, adjust as needed
    }
  
    update() {
      // Update character position based on speed, input, etc.
    }
  }

  //게임 initializeation
  
  document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
  
    const player = new Character(100, 100, 5, "blue");
    const enemy = new Character(400, 300, 3, "red");
  
    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      player.update();
      enemy.update();
  
      player.draw(ctx);
      enemy.draw(ctx);
  
      requestAnimationFrame(gameLoop);
    }
  
    gameLoop();
  });
  