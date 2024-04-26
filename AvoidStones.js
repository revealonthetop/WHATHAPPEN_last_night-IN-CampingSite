 //캔버스 객체
 let canvas;
 let ctx;
 let canvasBuffer;
 let bufferCtx;
 let threadSpeed = 16;

 //우주선
 let spaceship;
 let sx, sy, sw = 60, sh = 35;
 // 우주선의 각도와 속도
 let angle = 0;                 // 우주선 초기 각도
 let speedX = 0;                // 우주선의 X축 속도
 let speedY = 0;                // 우주선의 Y축 속도
 const rotationSpeed = 0.1;     // 우주선의 회전 속도
 const acceleration = 0.1;      // 가속도
 const friction = 0.9;          // 마찰력

 /// 이미지 신규 추가
 ///
// 우주선 이미지 변수 추가
let spaceshipImage;

// 이미지 로딩 함수
function loadImage() {
    spaceshipImage = new Image();
    spaceshipImage.src = "spaceship.png";
    spaceshipImage.onload = function() {
        initialize();
    };
}

 ///

 //배경이미지
 let background;

 //장애물
 let enemy = new Array();
 let enemyColor = ['gray', 'blue', 'silver'];
 let ellapse = 10;
 let enemySize = [3, 5,15]

 //타이머
 let loopInstance;

 //게임의 상태
 let STATE_START = false;
 let STATE_GAMEOVER = false;

 //키 상태 (게임시작 : enter, 게임다시시작 : space, 방향키 (4개))
 let keyPressed = [];

 //경과 시간
 let oldTime;
 let startTime;
 let totalTime;

 //이벤트 등록
 window.addEventListener('load', initialize, false);
 window.addEventListener('keydown', getKeyDown, false);
 window.addEventListener('keyup', getKeyUp, false);

 // 초기 로드시 html 에 인입 시키기
 function initialize() {
     canvas = document.getElementById('canvas');
     if (canvas == null || canvas.getContext == null)
         return;
     ctx = canvas.getContext('2d');

     canvasBuffer = document.createElement('canvas');
     canvasBuffer.width = canvas.width;
     canvasBuffer.height = canvas.height;
     bufferCtx = canvasBuffer.getContext('2d');

     // 키보드 이벤트 처리 등록
     handleKeyEvents();
     //게임 시작 메시지
     startMessage();

     //이미지 설정
     setImage();

     //반복 동작 설정
     loopInstance = setInterval(update, threadSpeed);
 }

 function startGame() {
     STATE_START = true;
     //캐릭터 초기 위치
     sx = canvas.width / 2;
     sy = canvas.height / 2;
     sw = 60;
     sh = 35;

     //장애물 생성
     createObstacle();

     //현재 시간 저장

     startTime = getTime();
 }
// 점수 (수정필요)
 function getTime() {
     let date = new Date();
     let time = date.getTime();
     return time;
 }
 // 키보드 이벤트 처리
 function handleKeyEvents() {
    window.addEventListener('keydown', (event) => {
        switch(event.keyCode) {
            case 37: // 왼쪽 화살표 키
                angle -= rotationSpeed; // 좌회전
                break;
            case 39: // 오른쪽 화살표 키
                angle += rotationSpeed; // 우회전
                break;
            case 38: // 위쪽 화살표 키
                // 앞으로 가는 속도 증가
                speedX += Math.cos(angle) * acceleration;
                speedY += Math.sin(angle) * acceleration;
                break;
            case 40: // 아래쪽 화살표 키
                // 뒤로 가는 속도 증가
                speedX -= Math.cos(angle) * acceleration;
                speedY -= Math.sin(angle) * acceleration;
                break;
        }
    });
}

 // 우주선의 위치 업데이트
function updateSpaceshipPosition() {
    // 속도 적용
    sx += speedX;
    sy += speedY;

    // 마찰력 적용
    speedX *= friction;
    speedY *= friction;
}



// 우주선 그리기 함수에서 우주선의 각도 적용하기
function drawSpaceship() {

    ctx.save(); // 현재 그리기 상태 저장
    ctx.translate(sx, sy); // 우주선의 위치로 이동
    ctx.rotate(angle); // 우주선의 각도로 회전

    // 우주선 그리기
    ctx.beginPath();
    ctx.moveTo(-sw / 2, -sh / 2);
    ctx.lineTo(sw / 2, 0);
    ctx.lineTo(-sw / 2, sh / 2);

    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();

    ctx.restore(); // 이전 그리기 상태 복원
}

 function update() {
     if ((keyPressed[13] == true) && (STATE_START == false)) { //엔터키 눌렀을 때
         //게임 시작
         console.log('게임 시작');

         startGame();
     }

     updateSpaceshipPosition();
     drawSpaceship();

     if (keyPressed[32] == true) {
         document.location.reload();
         startGame();
     }

     if (STATE_START) {
         //장애물 이동
         moveObstacle(ellapse);

         //그림 그리기
         drawAll();
     }
 }

 // 장애물 움직임
 function moveObstacle(ellapse) {
     for (let i = 0; i < 60; i++) {
         let mx = enemy[i].vx * ellapse / 1000;
         let my = enemy[i].vy * ellapse / 1000;

         enemy[i].x = enemy[i].x + mx;
         enemy[i].y = enemy[i].y + my;

         if (enemy[i].x > canvas.width)
             enemy[i].x = 0;
         if (enemy[i].x < 0)
             enemy[i].x = canvas.width;
         if (enemy[i].y > canvas.height)
             enemy[i].y = 0;
         if (enemy[i].y < 0)
             enemy[i].y = canvas.height;

         //충돌 검사
         crashObstacle(i);
     }
 }
 // 충돌 검사
 function crashObstacle(index) {
     let mx = enemy[index].x;
     let my = enemy[index].y;
     // 이미지의 절반만큼 범위를 주고 충돌 검사.
     if (mx > sx - sw / 2 && mx < sx + sw / 2 && my > sy - sh / 2 && my < sy + sh / 2) {
         STATE_GAMEOVER = true;
     }
 }
// 장애물 생성
 function createObstacle() {
     enemy.length = 0;
     for (let i = 0; i < 60; i++) {
         enemy.push(
             {
                 x: Math.random() * canvas.width,
                 y: (i < 30) ? 20 : canvas.height - 20,
                 vx: Math.random() * 200 - 100,
                 vy: Math.random() * 200 - 100,
                 color: Math.floor(Math.random() * 3)
             }
         );
     }
 }


 function drawAll() {
     if (!STATE_START) {
         return;
     } else if (STATE_GAMEOVER) {
         //개임 오버 메시지
         STATE_START = false;
         drawText("bold 30px arial", "#ffff00", "center", "Game Over", 60);
         drawText("bold 20px arial", "#ffffff", "center", "Spacebar to Restart", 20);
     } else {
         //게임 시작 시 엔터키를 눌렀을 때
         bufferCtx.drawImage(background, 0, 0);
         bufferCtx.drawImage(spaceship, sx - sw / 2, sy - sh / 2);
         ctx.drawImage(canvasBuffer, 0, 0);

         //장애물 출력
         drawObstacle();

         totalTime = getTime() - startTime;
         ctx.font = "bold 20px arial";
         ctx.fillStyle = "#ffff00";
         ctx.textAlign = "center";
         ctx.fillText(totalTime, canvas.width - 30, 30);
     }
 }

 //장애물 출력
 function drawObstacle() {
     for (let i = 0; i < 60; i++) {
         ctx.beginPath();
         ctx.arc(enemy[i].x, enemy[i].y, enemySize[fizzbuzz(i)], 0, 2 * Math.PI);
         ctx.fillStyle = enemyColor[enemy[i].color];
         ctx.closePath();
         ctx.fill();
     }
 }

 function getKeyDown(event) {
     console.log(event);
     keyPressed[event.keyCode] = true;
 }

 function getKeyUp(event) {
     keyPressed[event.keyCode] = false;
 }
 // 이미지 세팅
 function setImage() {
     spaceship = new Image();
     spaceship.src = "spaceship.png";
     background = new Image();
     background.src = "space.jpg";
 }

 function drawText(font, color, align, text, ygap) {
     ctx.font = font;
     ctx.fillStyle = color;
     ctx.textAlign = align;
     ctx.fillText(text, canvas.width / 2, canvas.height / 2 - ygap);
 }

 function startMessage() {
     drawText("bold 30px arial", "#ffff00", "center", "Enter To Start", 60);
     drawText("bold 20px arial", "#ffffff", "center", "조작 방향키 ←↑→↓", 20);
 }

 function saveScore() {

 }

 function fizzbuzz(num) {
     let i = 1
     if ((num % 3 == 0) && (num % 5 == 0)) {
         return 2
     }
     if (num % 3 == 0) {
         return 0
     }
     if (num % 5 == 0) {
         return 1
     }
     return 1
 }
