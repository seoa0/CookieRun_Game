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
    hearts = parseFloat(sessionStorage.getItem('hearts'));

    // 공 이미지 로드
    let ballImage = new Image();
    ballImage.src = 'ball.jpeg'; // 공 이미지 경로

    let clearBlockImage = new Image();
    let plainBlockImage = new Image();
    let specialBlockImage = new Image();
    let randomBlockImage = new Image(); // 새로운 이미지 추가
    let hit1Image = new Image(); // 1번 맞은 블록 이미지
    let hit2Image = new Image(); // 2번 맞은 블록 이미지
    let hit3Image = new Image(); // 3번 맞은 블록 이미지

    let totalImages = 7; // 이미지 개수 업데이트
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
    randomBlockImage.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가
    hit1Image.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가
    hit2Image.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가
    hit3Image.onload = onLoadImage; // 새로운 이미지 로드 핸들러 추가

    // 이미지 소스 설정
    clearBlockImage.src = 'clear_block.png';
    plainBlockImage.src = 'block1.png';
    specialBlockImage.src = 'special_block.png';
    randomBlockImage.src = 'random_block.png'; // 새로운 이미지 경로 설정
    hit1Image.src = 'hit1_block.png'; // 새로운 이미지 경로 설정
    hit2Image.src = 'hit2_block.png'; // 새로운 이미지 경로 설정
    hit3Image.src = 'hit3_block.png'; // 새로운 이미지 경로 설정

    // 캔버스 요소와 그리기 컨텍스트 설정
    let canvas = document.getElementById("myCanvas");
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
    dx = parseFloat(sessionStorage.getItem('dx'));
    dy = parseFloat(sessionStorage.getItem('dy')); // 공 속도 변경

    // 패들 크기
    let paddleHeight = 10;
    let paddleWidth = parseFloat(sessionStorage.getItem('paddleWidth')); // 패들 길이 업데이트
    
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
            // 각 블록의 초기 값 설정
            let initialHitValue;
            if (randomBlocks.length < 3) {
                initialHitValue = 3;
            } else if (randomBlocks.length < 6) {
                initialHitValue = 2;
            } else {
                initialHitValue = 1;
            }
            randomBlocks.push({ x: randX, y: randY, initialHitValue: initialHitValue });
        }
    }

    // 블록 배열 생성
    let blocks = [];
    for (let c = 0; c < blockColumnCount; c++) {
        blocks[c] = [];
        for (let r = 0; r < blockRowCount; r++) {
            // 스페셜 블록 여부를 랜덤으로 결정
            let isSpecial = (c === specialBlockX && r === specialBlockY);
            let randomBlock = randomBlocks.find(block => block.x === c && block.y === r);
            let isRandomBlock = !!randomBlock;
            blocks[c][r] = { x: 0, y: 0, status: 1, isSpecial: isSpecial, remainingHits: randomBlock ? randomBlock.initialHitValue : 1, isRandom: isRandomBlock }; // 각 블록의 초기 상태
        }
    }

    // 게임 클리어 여부
    let gameClear = false;

    //악마맛쿠키
    let devilAbilityActive = sessionStorage.getItem('devilAbilityActive') === 'true';
    function deleteBlock(blocks) {
        let deleteBlocks = [];
    
        // // 중간에 있는 블록의 좌표
        // let middleBlockX = 7;
        // let middleBlockY = 2;
    
        while (deleteBlocks.length < 8) {
            let randX = Math.floor(Math.random() * blocks.length);
            let randY = Math.floor(Math.random() * blocks[0].length);
    
            let selectedBlock = blocks[randX][randY];
    
            // 조건에 맞지 않는 블록들을 선택하도록 필터링
            if (
                !selectedBlock.isSpecial && // 특별 블록 제외
                !(randX === clearX && randY === clearY) && // 중간 블록 제외
                !deleteBlocks.some(block => block.x === randX && block.y === randY) // 중복 블록 제외
            ) {
                deleteBlocks.push({ x: randX, y: randY });
            }
        }
    
        // 선택된 블록들을 삭제 (status를 0으로 설정)
        for (let block of deleteBlocks) {
            blocks[block.x][block.y].status = 0;
        }
    }
    
    // 블록 그리기 함수
    function drawBlocks() {
        if (devilAbilityActive) {
            deleteBlock(blocks); // devilAbilityActive가 true일 때 블록을 삭제
            devilAbilityActive = false; // 블록 삭제 후 devilAbilityActive를 false로 설정
            sessionStorage.setItem('devilAbilityActive', 'false'); // 세션 저장소에서도 업데이트
        }
    
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
                    } else if (blocks[c][r].isRandom) {
                        switch (blocks[c][r].remainingHits) {
                            case 3:
                                ctx.drawImage(randomBlockImage, blockX, blockY, blockWidth, blockHeight); // 랜덤 블록
                                break;
                            case 2:
                                ctx.drawImage(hit1Image, blockX, blockY, blockWidth, blockHeight); // 1번 맞은 블록
                                break;
                            case 1:
                                ctx.drawImage(hit2Image, blockX, blockY, blockWidth, blockHeight); // 2번 맞은 블록
                                break;
                            default:
                                ctx.drawImage(hit3Image, blockX, blockY, blockWidth, blockHeight); // 3번 맞은 블록
                                break;
                        }
                    } else {
                        ctx.drawImage(plainBlockImage, blockX, blockY, blockWidth, blockHeight); // 일반 블록
                    }
                    ctx.closePath();
                }
            }
        }
    }

    //정글전사맛 쿠키 양 옆 블록 같이 삭제
    let jungleAbilityActive = sessionStorage.getItem('jungleAbilityActive') === 'true';

    let bonustimeTime = 10000;
    // 공주맛 쿠키는 보너스 타임 두배
    bonustimeTime = parseFloat(sessionStorage.getItem('bonustimeTime'));

    // 공과 블록 간의 충돌 감지
    function collisionDetection() {
        for (let c = 0; c < blockColumnCount; c++) {
            for (let r = 0; r < blockRowCount; r++) {
                let block = blocks[c][r];
                if (block.status === 1) {
                    let blockX = block.x;
                    let blockY = block.y;
                    if(jungleAbilityActive){ // 정글전사맛 쿠키 선택시 양 옆의 블록도 데미지
                        if (x > blockX - blockWidth && x < blockX + 2 * blockWidth && y > blockY && y < blockY + blockHeight) {
                            dy = -dy; // 충돌 시 공의 이동 방향 변경
                            block.remainingHits--; // 충돌 시 값 감소
                            if (block.remainingHits <= 0) {
                                block.status = 0; // 값이 0이 되면 블록 제거
                            }
                            // 만약 클리어 블록을 깼다면 게임 클리어 처리
                            if (c === clearX && r === clearY && gameClear === false) {
                                gameClear = true;
                                alert("GAME CLEAR!");
                                clearInterval(gameStart);
                                goToPage('level1_step2.html');
                            }
                            // 만약 보너스타임 블록을 깼다면 보너스타임 화면을 표시하고, 10초 후에 감추고 공을 5개로 증가시킴
                            if (block.isSpecial) {
                                document.getElementById('bonustime').style.display = 'block';
                                var bonusgame = setInterval(drawBonusGame, 10); // 공을 5개로 증가시킴
                                setTimeout(function() {
                                    clearInterval(bonusgame);
                                    document.getElementById('bonustime').style.display = 'none'; // 10초 후에 숨김
                                    gameStart;
                                }, 10000);
                            }
                        }
                    }
                    else{ // 나머지 쿠키
                        if (x > blockX && x < blockX + blockWidth && y > blockY && y < blockY + blockHeight) {
                            dy = -dy; // 충돌 시 공의 이동 방향 변경
                            block.remainingHits--; // 충돌 시 값 감소
                            if (block.remainingHits <= 0) {
                                block.status = 0; // 값이 0이 되면 블록 제거
                            }
                            // 만약 클리어 블록을 깼다면 게임 클리어 처리
                            if (c === clearX && r === clearY && gameClear === false) {
                                gameClear = true;
                                // alert("GAME CLEAR!");
                                // document.location.reload();
                                clearInterval(gameStart);
                                //팝업창 개설 -> 게임 오버 OR 게임 클리어 출력 + 아래에 확인 버튼 생성
                                //->확인 버튼에서 click 이벤트 발생할 경우 goToPage(~); 실행
                                createPopup('level1.html', 'level1_choice.png');
                            }
                            // 만약 보너스타임 블록을 깼다면 보너스타임 화면을 표시하고, 10초 후에 감추고 공을 5개로 증가시킴
                            if (block.isSpecial) {
                                document.getElementById('bonustime').style.display = 'block';
                                var bonusgame = setInterval(drawBonusGame, 10); // 공을 5개로 증가시킴
                                setTimeout(function() {
                                    clearInterval(bonusgame);
                                    document.getElementById('bonustime').style.display = 'none'; // 10초 후에 숨김
                                    gameStart;
                                }, 10000);
                            }
                        }
                    }
                }
            }
        }
    }

    //보너스 공 5개 만들기
    var balls = [];
    var ballnumber = 5;   
    for(var i =0; i < ballnumber; i++){
        balls.push({
           bonusX : canvas.width / 2,
           bonusY : canvas.height - paddleHeight - 70,
           bonusDx : 2,
           bonusDy : 2,
           bonusBallImage : ballImage  
        });
    }

    //공 그리기
    function drawBonusBalls() {
        //보너스 공 5개 그리기
        balls.forEach(function(ball) {
            ctx.drawImage(ball.bonusBallImage, ball.bonusX - 10, ball.bonusY - 10, 40, 40);
        });
    }

    //공 이동 + 경계 처리
    function bonusBallsMove() {
        //보너스 공 이동 + 경계 처리
        balls.forEach(function(ball) {
            ball.bonusX += ball.bonusDx;
            ball.bonusY += ball.bonusDy;

            if (ball.bonusX + ball.bonusDx > canvas.width - 30 || ball.bonusX + ball.bonusDx < 10) {ball.bonusDx = -ball.bonusDx;}
            if (ball.bonusY + ball.bonusDy > canvas.height - 10 || ball.bonusY + ball.bonusDy < 10) {ball.bonusDy = -ball.bonusDy;}
        });
    }

    //공과 블록간의 충돌 감지
    function  bonusCollisionDetection() {
        //보너스 공과 블록간의 충돌 감지
        balls.forEach(function(ball) {
            for (let c = 0; c < blockColumnCount; c++) {
                for (let r = 0; r < blockRowCount; r++) {
                    let block = blocks[c][r];
                    if (block.status === 1) {
                        let blockX = block.x;
                        let blockY = block.y;
                        if (ball.bonusX > blockX && ball.bonusX < blockX + blockWidth && ball.bonusY > blockY && ball.bonusY < blockY + blockHeight) {
                            ball.bonusDy = -ball.bonusDy; // 충돌 시 공의 이동 방향 변경
                            block.status = 0; // 충돌한 블록 제거
                            // 만약 클리어 블록을 깼다면 게임 클리어 처리
                            if (c === clearX && r === clearY && gameClear === false) {
                                gameClear = true;
                                clearInterval(gameStart);
                                //팝업창 개설 -> 게임 오버 OR 게임 클리어 출력 + 아래에 확인 버튼 생성
                                //->확인 버튼에서 click 이벤트 발생할 경우 goToPage(~); 실행
                                createPopup('level1.html', 'level1_choice.png');
                            }
                        }
                    }
                }
            }
        });
    }

    // 패들과 충돌처리
    function bonusCollisionPaddle() {
        balls.forEach(function(ball) {
            if (ball.bonusY + ball.bonusDy > canvas.height - paddleHeight - 70 && ball.bonusX > paddleX && ball.bonusX < paddleX + paddleWidth) {ball.bonusDy = -ball.bonusDy;}
        });
    }

    // 공을 5개로 증가시키는 함수 (보너스타임)    
    function drawBonusGame() {
        //초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 패들 그리기
        drawPaddle();

        // 패들 이동
        movePaddle();

        // 블록 그리기
        drawBlocks();

        // 생명 그리기
        drawHearts();

        //공 그리기
        drawBonusBalls();

        // 공 그리기
        drawBall();

        //공 이동 + 경계 처리
        bonusBallsMove();

        // 공 이동
        x += dx;
        y += dy;

        // 공의 경계처리
        if (x + dx > canvas.width - 30 || x + dx < 10) {
            dx = -dx;
        }
        if (y + dy > canvas.height - 10 || y + dy < 10) {
            dy = -dy;
        }

        //공과 블록간의 충돌 감지
        bonusCollisionDetection();

        // 충돌 감지
        collisionDetection();

        // 패들과 충돌처리
        bonusCollisionPaddle();

        // 패들과 충돌처리
        if (y + dy > canvas.height - paddleHeight - 70 && x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            // 패들이랑 공이랑 계속 겹쳐서 일단 임시방편 (근데 무빙이 좀 어색함)
            //y = canvas.height - paddleHeight - 50 - 20; // 패들 위에서 공의 반지름 만큼 올리기
        }
    }   

    function createPopup(pageUrl, backgroundImageUrl) {
    
        // 새로운 블록 생성
        var popupBlock = $('<div class="popup-block"></div>');
        popupBlock.css({
            position: 'absolute', 
            top: '170px', 
            left: '50%', // 수평 가운데 정렬
            transform: 'translateX(-50%)',
            backgroundImage: 'url(' + backgroundImageUrl + ')', // 배경 이미지 지정
            backgroundSize: 'cover', 
            width: '600px',
            height: '419px',
            border: 'none',
            padding: '20px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: '9999' // 요소 맨 위에 표시
        });
        
        // 게임 결과 이미지 보여주기 -> Game Clear OR Game Over
        var gameresultImage = $('<div></div>');
        var gameresulturl = gameClear ? 'url("wingameresult.png")' : 'url("losegameresult.png")';
        gameresultImage.css({
            width: '520px',
            height: '210px',
            border: 'none',
            position: 'absolute', 
            margin: '100px 40px 50px 40px',
            ackgroundColor: 'transparent', 
            backgroundImage: gameresulturl, 
            backgroundSize: 'cover' 
        });

        popupBlock.append(gameresultImage);

        // 확인 버튼
        var cbutton = $('<button></button>');
        cbutton.css({ 
            position: 'absolute',
            top: '360px', 
            left: '230px', //화면 보고 수정 필요 
            width: '170px', 
            height: '56.5px', 
            border: 'none',
            transition: 'transform 0.2s ease',
            backgroundColor: 'transparent', 
            backgroundImage: 'url("choice_button.png")',//변경 필요
            backgroundSize: 'cover' 
        });
        
        cbutton.hover(function() {
            $(this).css('transform', 'scale(1.1)'); 
        }, function() {
            $(this).css('transform', 'scale(1)'); 
        });

        cbutton.click(function() {
            goToPage(pageUrl);
        });

        popupBlock.append(cbutton);

        $('body').append(popupBlock);
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
        let wolfAbilityActive = sessionStorage.getItem('wolfAbilityActive') === 'true';
        if (wolfAbilityActive && Math.random() < 0.5) {
            // 50% 확률로 생명이 감소하지 않음
            console.log("웨어울프맛 쿠키 능력 발동: 생명이 감소하지 않았습니다.");
            hearts++;
        }

        hearts--; // 생명 감소
        if (hearts === 0) {
            gameOver();
        } else {
            // 게임이 종료되지 않았다면, 공과 패들의 초기 위치로 돌아가기
            x = canvas.width / 2;
            y = canvas.height - paddleHeight - 70;
            dx = parseFloat(sessionStorage.getItem('dx'));
            dy = parseFloat(sessionStorage.getItem('dy')); // 공 속도 초기화
            paddleX = (canvas.width - paddleWidth) / 2;
        }
    }

    // 게임 오버 처리 함수
    function gameOver() {
        // alert("GAME OVER");
        // document.location.reload();
        clearInterval(gameStart);
        //팝업창 개설 -> 게임 오버 OR 게임 클리어 출력 + 아래에 확인 버튼 생성
        //->확인 버튼에서 click 이벤트 발생할 경우 goToPage(~); 실행
        createPopup('level1.html', 'level1_choice.png');
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

    // 패들 이동 속도
    let paddleSpeed = 5;
    paddleSpeed = parseFloat(sessionStorage.getItem('paddleSpeed'));
    
    // 패들 이동 함수
    function movePaddle() {
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += paddleSpeed; // 패들 이동 속도를 증가시킴
        } else if (leftPressed && paddleX > 0) {
            paddleX -= paddleSpeed; // 패들 이동 속도를 증가시킴
        }
    }

    let ballRadius = 10;
    ballRadius = parseFloat(sessionStorage.getItem('ballRadius'));

    // 공 이미지 그리기 함수
    function drawBall() {
        ctx.drawImage(ballImage, x - ballRadius, y - ballRadius, ballRadius*2, ballRadius*2); // 이미지 크기는 20x20, 이미지의 중심을 공의 중심으로 설정하기 위해 x-10, y-10
    }

    // 패들 그리기 함수
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.closePath();
    }

    // 눈설탕 벽 그리기
    let wallSize = 100;
    let wallX1 = canvas.width * 2 / 7;
    let wallX2 = canvas.width * 5 / 7;
    let wallY = paddleY - 1;
    let snowAbilityActive = sessionStorage.getItem('snowAbilityActive') === 'true';
    function drawWalls() {
        if(snowAbilityActive){
            //벽1
            ctx.beginPath();
            ctx.rect(wallX1, wallY, wallSize, paddleHeight);
            ctx.fillStyle = 'blue';
            ctx.fill();
            ctx.closePath();
            //벽2
            ctx.beginPath();
            ctx.rect(wallX2, wallY, wallSize, paddleHeight);
            ctx.fillStyle = 'blue';
            ctx.fill();
            ctx.closePath();
        }
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

        // 눈설탕맛 선택시 하단 벽 그리기
        drawWalls();

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
                dx = 2 * parseFloat(sessionStorage.getItem('dx')) * Math.sin(angle);
                dy = 2 * parseFloat(sessionStorage.getItem('dy')) * Math.cos(angle);
            } else {
                heartLost(); // 공이 바닥에 닿으면 생명 감소
            }
        }

        // 눈설탕맛 벽 충돌처리
        if(snowAbilityActive){
            if (y + dy > canvas.height - paddleHeight - 20 -1) {
                if ((x > wallX1 && x < wallX1 + wallSize) || (x > wallX2 && x < wallX2 + wallSize)) {
                    dy = -dy;
                }
            }
        }

        // 공 이동
        x += dx;
        y += dy;
    }

    // 게임 시작
    let gameStart = setInterval(drawGame, 10);
});
