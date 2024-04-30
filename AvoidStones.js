//캔버스 객체
var canvas;
var ctx;
var canvasBuffer;
var bufferCtx;
var threadSpeed = 16;

//사람크기
var human;
var sx, sy, sw, sh;

//배경이미지
var startBgImage;
var background;

//장애물
var findEnemy = new Array();
var findEnemyColors = ['red', 'blue', 'green'];
var ellapse = 10;
var trackers = new Array();
var trackerColors = ['black', 'Purple']

//타이머
var loopInstance;

//게임의 상태

var STATE_START = false;
var STATE_GAMEOVER = false;
var STATE_GAMEWIN = false;

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
    sw = 100;
    sh = 100;

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
    // 타겟 위치 업데이트 -> 주인공
    if (STATE_START) {
        for (var i = 0; i < trackers.length; i++) {
            trackers[i].target.x = sx;
            trackers[i].target.y = sy;
        }
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
            removeObstacleAll();
        }
    }
    
    // 장애물 GAMEOVER 충돌 검사
    for (var i = 0; i < trackers.length; i++) {
        var tracker = trackers[i];
        var dx = tracker.target.x - tracker.x;
        var dy = tracker.target.y - tracker.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx);

        // 속도 계산 (일정한 속도로 이동)
        var speed = 100; // 원하는 속도 값
        tracker.vx = Math.cos(angle) * speed;
        tracker.vy = Math.sin(angle) * speed;

        tracker.x += tracker.vx * ellapse / 1000;
        tracker.y += tracker.vy * ellapse / 1000;

        // 화면 경계 체크
        if (tracker.x > canvas.width) tracker.x = 0;
        if (tracker.x < 0) tracker.x = canvas.width;
        if (tracker.y > canvas.height) tracker.y = 0;
        if (tracker.y < 0) tracker.y = canvas.height;

        // gameOver 충돌 검사 함수 추가
        crashObstacleGameOver(i)
    }
}


// gameover 충돌검사
function crashObstacleGameOver(index) {
    // 게임 오버 상태가 아닐 때만 충돌 검사를 수행
    if (!STATE_GAMEOVER) {
        var mx = trackers[index].x;
        var my = trackers[index].y;

        if (mx > sx - sw / 2 && mx < sx + sw / 2 && my > sy - sh / 2 && my < sy + sh / 2) {
            STATE_GAMEOVER = true;
        }
    }
}

// 게임 승리조건
function removeObstacleAll() {
    if (!STATE_GAMEOVER) {
        if (Array.isArray(findEnemy) && findEnemy.length === 0) {
            STATE_GAMEWIN = true
        }
        return
    }
}

// 점수 올리는 충돌검사
function crashObstacleGetScore(index) {
    var mx = findEnemy[index].x;
    var my = findEnemy[index].y;

    if (mx > sx - sw / 2 && mx < sx + sw / 2 && my > sy - sh / 2 && my < sy + sh / 2) {
        findEnemy.splice(index, 1)
        score += 1000
    }
}

function createObstacle() {
    findEnemy = []; // 배열 초기화
    trackers = [];
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
    for (var i = 0; i < 2; i++) {
        trackers.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0, // 초기 속도는 0
            vy: 0,
            color: Math.floor(Math.random() * 3),
            target: { x: sx, y: sy } // 타겟은 플레이어의 초기 위치
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
    } else if (STATE_GAMEWIN) {
        // 게임 이겼을 시
        STATE_START = false;
        drawText("bold 40px arial", "#00000", "center", "당신의 승리", 60);
        drawText("bold 50px arial", "#00000", "center", "축하합니다", 0);
        drawText("bold 20px arial", "#00000", "center", "Spacebar to Restart", -30);
    } else {
        //게임 시작 시 엔터키를 눌렀을 때
        bufferCtx.drawImage(background, 0, 0);
        bufferCtx.drawImage(human, sx - sw / 2, sy - sh / 2);
        ctx.drawImage(canvasBuffer, 0, 0);

        //장애물 출력
        drawObstacle();

        // 점수 출력
        var hapscore = score - (getTime() - startTime);
        if (hapscore <= 0){
            hapscore = 0;
        }
        totalTime = `점수 : ${hapscore}`;
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
            ctx.fillStyle = findEnemyColors[findEnemy[i].color];
            ctx.closePath();
            ctx.fill();
        }
    }
    // 추격 장애물
    for (var i = 0; i < trackers.length; i++) {
        var tracker = trackers[i];
        ctx.font = "bold 30px arial";
        ctx.fillStyle = trackerColors[tracker.color];
        if (i === 0) {
            ctx.fillText("호박벌", tracker.x, tracker.y);
        }
        else
            ctx.fillText("아이들", tracker.x, tracker.y);

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
    startBgImage.onload = function () {
        ctx.drawImage(startBgImage, 0, 0)
        drawText("bold 70px arial", "#606060", "right", "Enter To Start", 0);
        drawText("bold 20px arial", "#606060", "rigth", "조작 방향키 ←↑→↓", -40);
    }
    startBgImage.src = "startBackgroud.png";
}
// 점수 저장
