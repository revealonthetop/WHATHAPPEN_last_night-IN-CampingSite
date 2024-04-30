//캔버스 객체
var canvas;
var ctx;
var canvasBuffer;
var bufferCtx;
var threadSpeed = 16;

//사람크기
var human;
var sx, sy;
var sw = 100;
var sh = 100;

//배경이미지
var startBgImage;
var background;

//장애물
var findEnemy = new Array();
var findEnemyColor = ['red', 'blue', 'green'];
var ellapse = 10;
var avoid_Enemy;

//타이머
var loopInstance;

//게임의 상태

var STATE_START = false;
var STATE_GAMEOVER = false;

//키 상태 (게임시작 : enter, 게임다시시작 : space, 방향키 (4개))
var keyPressed = [];

//경과 시간
var oldTime;
var startTime;
var totalTime;
var score = 0;

//이벤트 등록
window.addEventListener('load', initialize, false);
window.addEventListener('keydown', getKeyDown, false);
window.addEventListener('keyup', getKeyUp, false);

function initialize() {
    canvas = document.getElementById('canvas');
    if (canvas == null || canvas.getContext == null)
        return;
    ctx = canvas.getContext('2d');

    canvasBuffer = document.createElement('canvas');
    canvasBuffer.width = canvas.width;
    canvasBuffer.height = canvas.height;
    bufferCtx = canvasBuffer.getContext('2d');

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

function getTime() {
    var date = new Date();
    var time = date.getTime();
    delete date;
    return time;
}

function update() {
    if ((keyPressed[13] == true) && (STATE_START == false)) { //엔터키 눌렀을 때
        //게임 시작
        console.log('게임 시작');

        startGame();
    }

    if (keyPressed[38]) {
        sy = sy - 4;
    }
    if (keyPressed[40]) {
        sy = sy + 4;
    }
    if (keyPressed[37]) {
        sx = sx - 4;
    }
    if (keyPressed[39]) {
        sx = sx + 4;
    }

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

function moveObstacle(ellapse) {
    for (var i = 0; i < 60; i++) {
        if (findEnemy[i]) {
            var mx = findEnemy[i].vx * ellapse / 1000;
            var my = findEnemy[i].vy * ellapse / 1000;

            findEnemy[i].x = findEnemy[i].x + mx;
            findEnemy[i].y = findEnemy[i].y + my;

            if (findEnemy[i].x > canvas.width)
                findEnemy[i].x = 0;
            if (findEnemy[i].x < 0)
                findEnemy[i].x = canvas.width;
            if (findEnemy[i].y > canvas.height)
                findEnemy[i].y = 0;
            if (findEnemy[i].y < 0)
                findEnemy[i].y = canvas.height;

            //충돌 검사
            crashObstacleGetScore(i);
        }

    }
}




// gameover 충돌검사
// function crashObstacleGameOver(index) {
//     // 게임 오버 상태가 아닐 때만 충돌 검사를 수행
//     if (!STATE_GAMEOVER) {
//         var mx = avoid_Enemy[index].x;
//         var my = avoid_Enemy[index].y;

//         // if (mx > sx - sw / 2 && mx < sx + sw / 2 && my > sy - sh / 2 && my < sy + sh / 2) {
//         //     STATE_GAMEOVER = true;
//         // }
//     }
// }

// 점수 올리는 충돌검사
function crashObstacleGetScore(index) {
    var mx = findEnemy[index].x;
    var my = findEnemy[index].y;

    if (mx > sx - sw / 2 && mx < sx + sw / 2 && my > sy - sh / 2 && my < sy + sh / 2) {
        findEnemy.splice(index, 1)
        score += 100
    }
}

function createObstacle() {
    findEnemy = []; // 배열 초기화
    for (var i = 0; i < 60; i++) {
        findEnemy.push(
            {
                x: Math.random() * canvas.width,
                y: (i < 30) ? 20 : canvas.height - 20,
                vx: Math.random() * 200 - 100,
                vy: Math.random() * 200 - 100,
                color: Math.floor(Math.random() * 3)
            });
    }
}



function drawAll() {
    if (!STATE_START) {
        return;
    } else if (STATE_GAMEOVER) {
        //게임 오버 메시지
        STATE_START = false;
        drawText("bold 30px arial", "#00000", "center", "Game Over", 60);
        drawText("bold 20px arial", "#00000", "center", "Spacebar to Restart", 20);
    } else {
        //게임 시작 시 엔터키를 눌렀을 때
        bufferCtx.drawImage(background, 0, 0);
        bufferCtx.drawImage(human, sx - sw / 2, sy - sh / 2);
        ctx.drawImage(canvasBuffer, 0, 0);

        //장애물 출력
        drawObstacle();

        // 점수 출력
        totalTime = `점수 : ${(getTime() - startTime) + score}`;
        ctx.font = "bold 30px arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText(totalTime, canvas.width - 100, 40);
    }
}

//장애물 출력
function drawObstacle() {
    for (var i = 0; i < findEnemy.length; i++) {
        var obstacle = findEnemy[i];
        if (obstacle) {
            ctx.beginPath();
            ctx.arc(findEnemy[i].x, findEnemy[i].y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = findEnemyColor[findEnemy[i].color];
            ctx.closePath();
            ctx.fill();
        }
    }
}

function getKeyDown(event) {
    console.log(event);
    keyPressed[event.keyCode] = true;
}

function getKeyUp(event) {
    keyPressed[event.keyCode] = false;
}

function setImage() {
    human = new Image();
    human.src = "human.png";
    background = new Image();
    background.src = "ground.jpg";
}

function drawText(font, color, align, text, ygap) {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 - ygap);
}



function startMessage() {
    startBgImage = new Image();
    startBgImage.src = "startBackgroud.png";
    ctx.drawImage(startBgImage, 0, 0)
    drawText("bold 30px arial", "#00000", "center", "Enter To Start", 60);
    drawText("bold 20px arial", "#00000", "center", "조작 방향키 ←↑→↓", 20);
}