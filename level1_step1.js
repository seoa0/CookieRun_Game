$(document).ready(function() {
    // 페이지가 로드될 때 페이드 인 효과 적용
    $('body').addClass('fade-in');

    // 페이지 이동 함수
    function goToPage(url) {
        $('body').addClass('fade-out'); // 페이드 아웃 효과 추가
        setTimeout(function() {
            window.location.href = url; // 지정된 시간 후에 새로운 페이지로 이동
        }, 500); // 페이드 아웃 애니메이션 시간과 동일
    }

    // 돌아가기 버튼 클릭 시 이전 html로 이동
    $('.back-button').click(function() {
        goToPage('level1.html'); 
    });

    // 플레이어의 생명 수
    let hearts = 3;

    // 공 이미지 로드
    let ballImage = new Image();
    ballImage.src = 'ball.jpeg'; // 공 이미지 경로

    let clearBlockImage = new Image();
    let plainBlockImage = new Image();
    let specialBlockImage = new Image();

    let totalImages = 3;
    let loadedImages = 0;

    // 이미지가 로드되면 호출될 함수
    function onLoadImage() {
        loadedImages++;
        if (loadedImages === totalImages) {
            drawBlocks(); // 모든 이미지가 로드된 후에 블록을 그립니다.
        }
    }

    // 이미지 로드를 위한 이벤트 핸들러 등록
    clearBlockImage.onload = onLoadImage;
    plainBlockImage.onload = onLoadImage;
    specialBlockImage.onload = onLoadImage;

    // 이미지 소스 설정
    clearBlockImage.src = 'clear_block.png';
    plainBlockImage.src = 'block1.png';
    specialBlockImage.src = 'special_block.png';

    // 캔버스 요소와 그리기 컨텍스트 설정
    let canvas = document.getElementById("myCanvars");
    let ctx = canvas.getContext('2d');

    // 캔버스 크기 설정
    canvas.width = 740;
    canvas.height = 495;

    // 블록 관련 변수 설정
    let blockRowCount = 3; // 블록 행 개수
    let blockColumnCount = 13; // 블록 열 개수
    let blockWidth = 50; // 블록 너비
    let blockHeight = 50; // 블록 높이
    let blockPadding = 2; // 블록 간격
    let blockOffsetTop = 23; // 상단 여백
    let blockOffsetLeft = 30; // 좌측 여백

    // 공의 이동 속도
    let dx = 2;
    let dy = -2;  // 공이 처음에 위로 이동하도록 설정
    dx = parseFloat(localStorage.getItem('dx'));
    dy = parseFloat(localStorage.getItem('dy'));
    console.log(dx, dy);

    // 패들 크기
    let paddleHeight = 10;
    let paddleWidth = 100;
    paddleWidth = localStorage.getItem('paddleWidth'); // 패들 길이 업데이트
    
    console.log(paddleWidth);

    // 공의 초기 위치
    let x = canvas.width / 2;
    let y = canvas.height - paddleHeight - 70; // 패들 위에 공을 배치하기 위해 paddleHeight 만큼 위로 올림

    // 패들 초기 위치
    let paddleX = (canvas.width / 2) - (paddleWidth / 2);  
    let paddleY = canvas.height - paddleHeight - 20;

    // 키보드 입력 처리를 위한 변수 초기 설정
    let leftPressed = false;
    let rightPressed = false;

    // 키보드 입력 이벤트 리스너 등록
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    // 랜덤으로 보너스타임 블록 선택
    let specialBlockX = Math.floor(Math.random() * blockColumnCount);
    let specialBlockY = Math.floor(Math.random() * blockRowCount);

    // 클리어 블록
    let clearX = parseInt(blockColumnCount / 2);
    let clearY = parseInt(blockRowCount / 2);

    // 임의의 8개 블록 선택
    let randomBlocks = [];
    while (randomBlocks.length < 8) {
        let randX = Math.floor(Math.random() * blockColumnCount);
        let randY = Math.floor(Math.random() * blockRowCount);
        if (!randomBlocks.some(block => block.x === randX && block.y === randY)) {
            randomBlocks.push({ x: randX, y: randY });
        }
    }

    // 블록 배열 생성
    let blocks = [];
    for (let c = 0; c < blockColumnCount; c++) {
        blocks[c] = [];
        for (let r = 0; r < blockRowCount; r++) {
            // 스페셜 블록 여부를 랜덤으로 결정
            let isSpecial = (c === specialBlockX && r === specialBlockY);
            let isRandomBlock = randomBlocks.some(block => block.x === c && block.y === r);
            blocks[c][r] = { x: 0, y: 0, status: 1, isSpecial: isSpecial, hitCount: 0, isRandom: isRandomBlock }; // 각 블록의 초기 상태
        }
    }

    // 게임 클리어 여부
    let gameClear = false;

    // 블록 그리기 함수
    function drawBlocks() {
        for (let c = 0; c < blockColumnCount; c++) {
            for (let r = 0; r < blockRowCount; r++) {
                if (blocks[c][r].status === 1) {
                    let blockX = (c * (blockWidth + blockPadding)) + blockOffsetLeft;
                    let blockY = (r * (blockHeight + blockPadding)) + blockOffsetTop;
                    blocks[c][r].x = blockX;
                    blocks[c][r].y = blockY;
                    ctx.beginPath();
                    ctx.rect(blockX, blockY, blockWidth, blockHeight);
                    if (c === clearX && r === clearY) {
                        ctx.drawImage(clearBlockImage, blockX, blockY, blockWidth, blockHeight); // 클리어 블록
                    } else if (blocks[c][r].isSpecial) {
                        ctx.drawImage(specialBlockImage, blockX, blockY, blockWidth, blockHeight); // 보너스타임 블록
                    } else {
                        ctx.drawImage(plainBlockImage, blockX, blockY, blockWidth, blockHeight); // 일반 블록
                    }
                    ctx.closePath();
                }
            }
        }
    }

    // 공과 블록 간의 충돌 감지
    function collisionDetection() {
        for (let c = 0; c < blockColumnCount; c++) {
            for (let r = 0; r < blockRowCount; r++) {
                let block = blocks[c][r];
                if (block.status === 1) {
                    let blockX = block.x;
                    let blockY = block.y;
                    if (x > blockX && x < blockX + blockWidth && y > blockY && y < blockY + blockHeight) {
                        dy = -dy; // 충돌 시 공의 이동 방향 변경
                        if (block.isRandom) {
                            block.hitCount++; // 충돌 횟수 증가
                            if (block.hitCount >= 2) {
                                block.status = 0; // 2번 충돌 시 블록 제거
                            }
                        } else {
                            block.status = 0; // 일반 블록은 1번 충돌 시 제거
                        }
                        // 만약 클리어 블록을 깼다면 게임 클리어 처리
                        if (c === clearX && r === clearY && gameClear === false) {
                            gameClear = true;
                            alert("GAME CLEAR!");
                            document.location.reload();
                            clearInterval(gameStart);
                        }
                        // 만약 보너스타임 블록을 깼다면 보너스타임 화면을 표시하고, 10초 후에 감추고 공을 5개로 증가시킴
                        if (block.isSpecial) {
                            document.getElementById('bonustime').style.display = 'block';
                            setTimeout(function() {
                                document.getElementById('bonustime').style.display = 'none'; // 10초 후에 숨김
                                increaseBalls(); // 공을 5개로 증가시킴
                            }, 10000);
                        }
                    }
                }
            }
        }
    }

    // 공을 5개로 증가시키는 함수 (보너스타임)
    function increaseBalls() {
        // 공을 5개로 증가시키는 로직을 추가합니다.
        // 예를 들어, 새로운 공 객체를 생성하고 이들을 화면에 표시하는 코드를 추가할 수 있습니다.
    }

    // 생명을 표시하는 함수
    function drawHearts() {
        let heartContainer = document.querySelector('.heart');
        heartContainer.innerHTML = ''; // 이전에 있던 하트를 지우고 다시 그리기 위해 비워줍니다.
        for (let i = 0; i < hearts; i++) {
            let heartImage = document.createElement('img');
            heartImage.src = 'heart.png';
            heartImage.width = '45';
            heartContainer.appendChild(heartImage);
        }
    }

    // 생명이 감소할 때의 처리 함수
    function heartLost() {
        hearts--; // 생명 감소
        if (hearts === 0) {
            gameOver();
        } else {
            // 게임이 종료되지 않았다면, 공과 패들의 초기 위치로 돌아가기
            x = canvas.width / 2;
            y = canvas.height - paddleHeight - 70;
            dx = 2; // 공의 이동 속도 초기화
            dy = -2; // 공의 이동 방향 초기화
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    // 게임 오버 처리 함수
    function gameOver() {
        alert("GAME OVER");
        document.location.reload();
        clearInterval(gameStart);
    }

    // 키보드 다운 이벤트 핸들러
    function keyDownHandler(e) {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            rightPressed = true;
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            leftPressed = true;
        }
    }

    // 키보드 업 이벤트 핸들러
    function keyUpHandler(e) {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            rightPressed = false;
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            leftPressed = false;
        }
    }

    // 패들 이동 함수
    function movePaddle() {
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 5; // 패들 이동 속도를 증가시킴
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 5; // 패들 이동 속도를 증가시킴
        }
    }

    // 공 이미지 그리기 함수
    function drawBall() {
        ctx.drawImage(ballImage, x - 10, y - 10, 20, 20); // 이미지 크기는 20x20, 이미지의 중심을 공의 중심으로 설정하기 위해 x-10, y-10
    }

    // 패들 그리기 함수
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.closePath();
    }

    // 게임 그리기 함수
    function drawGame() {
        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 공 그리기
        drawBall();

        // 패들 이동
        movePaddle();

        // 패들 그리기
        drawPaddle();

        // 블록 그리기
        drawBlocks();

        // 생명 그리기
        drawHearts();

        // 충돌 감지
        collisionDetection();

        // 공의 경계처리
        if (x + dx > canvas.width - 10 || x + dx < 10) {
            dx = -dx;
        }
        if (y + dy < 10) {
            dy = -dy;
        }

        // 패들과 충돌처리
        if (y + dy > canvas.height - paddleHeight - 20) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
                // 패들과의 충돌 위치에 따라 공의 이동 방향을 조정
                let collisionPoint = x - (paddleX + paddleWidth / 2);
                collisionPoint = collisionPoint / (paddleWidth / 2);
                let angle = collisionPoint * (Math.PI / 3); // 최대 60도 각도로 튕기기
                dx = 2 * parseFloat(localStorage.getItem('dx')) * Math.sin(angle);
                dy = 2 * parseFloat(localStorage.getItem('dy')) * Math.cos(angle);
                console.log(dx, dy)
            } else {
                heartLost(); // 공이 바닥에 닿으면 생명 감소
            }
        }

        // 공 이동
        x += dx;
        y += dy;
    }

    // 게임 시작
    let gameStart = setInterval(drawGame, 10);
});
