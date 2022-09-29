let SPACE_KEY = 32;
let CTRL_KEY = 17;
let UP_KEY = 38;
let LEFT_KEY = 37;
let RIGHT_KEY = 39;
let BG_WIDTH = 800;
let BG_HEIGHT = 500;
let PADDING = 10;
let HERO_MOVEMENT = 5;
let BULLET_MOVEMENT = 15;
let MIN_ENEMY_MOVEMENT = 15;
let MAX_ENEMY_MOVEMENT = 75;
let ENEMY_W = 40;
let ENEMY_H = 40;
let MAX_ENEMY_PASSES = 50;
let LIVES_AT_START = 5;
let ENEMY_ENTER_POS = PADDING;
let EXIT_POS = BG_HEIGHT - (PADDING + ENEMY_H);

let killCount = rotate = level = noOfEnemies = 0;
let mysteryKill = -1;
let time = new Date().getTime();
let over = spaceKeyPressed = ctrlKeyPressed = upKeyPressed = leftKeyPressed = rightKeyPressed = fired = false;
let mysteryPassed = true;

let hero, bullet, enemyContainer, lives, score, killed, passed, deadBravo, levelShow, enemies, bonus,
radarHero, radarBullet, radarEnemyContainer, radarEnemies;

window.onload = () => {
	initialize();
	setInterval(listen, 10);
}

function initialize() {
	hero = document.getElementById("hero");
	bullet = document.getElementById("bullet");
	enemyContainer = document.getElementById("enemyContainer");
	lives = document.getElementById("lives");
	score = document.getElementById("score");
	killed = document.getElementById("killed");
	passed = document.getElementById("passed");
	deadBravo = document.getElementById("deadBravo");
	levelShow = document.getElementById("levelShow");
	radarHero = document.getElementById("radarHero");
	radarBullet = document.getElementById("radarBullet");
	radarEnemyContainer = document.getElementById("radarEnemyContainer");
	let help = document.getElementById("help");

	lives.innerHTML = LIVES_AT_START;
	document.getElementById("helpLives").innerHTML = LIVES_AT_START;
	document.getElementById("helpPasses").innerHTML = MAX_ENEMY_PASSES;
	document.getElementById("enemiesHit").innerHTML = (MAX_ENEMY_MOVEMENT - MIN_ENEMY_MOVEMENT)/2;
	help.onclick = () => {
		help.style.top = 150;
		help.style.visibility = "hidden";
		document.getElementById("helpText").style.visibility = "visible";
	};

	hero.w = 100;
	hero.h = 60;
	hero.x = (BG_WIDTH - hero.w) / 2;
	hero.y = BG_HEIGHT - (hero.h + PADDING + 20);
	bullet.w = 20;
	bullet.h = 20;
	bullet.x = (BG_WIDTH - bullet.w) / 2;
	bullet.y = hero.y;
	levelUp();
}

function levelUp() {
	level++;
	levelShow.style.visibility = "visible";
	if (level < 8) {
		levelShow.innerHTML = "Level " + level;
	} else {
		levelShow.innerHTML = "Bonus Round!";
		let time2 = new Date().getTime() - time;
		if (time2 < 185000)
			time = parseInt(time2/1000);
		setTimeout(() => {
			over = true;
		}, 20000);
	}
	setTimeout(() => {
		levelShow.style.visibility = "hidden";
	}, 1000);
	if (level == 1 || level == 4 || level == 6 || level == 8)
		noOfEnemies++;
	let e = e2 = "";
	for (let i=0; i<noOfEnemies; i++) {
		e += "<div class='enemy'></div>";
		enemyContainer.innerHTML = e;
		e2 += "<div class='radarEnemy'></div>";
		radarEnemyContainer.innerHTML = e2;
	}
	enemies = document.getElementsByClassName("enemy");
	radarEnemies = document.getElementsByClassName("radarEnemy");
	for (let i=0; i<noOfEnemies; i++) {
		newEnemy(i);
		radarEnemies[i].style.left = enemies[i].x / 5;
		radarEnemies[i].style.top = enemies[i].y / 5;
		if (level > 7)
			radarEnemies[i].style.visibility = "hidden";
	}
	bonus = parseInt((MAX_ENEMY_MOVEMENT - MIN_ENEMY_MOVEMENT)/6 * (2*Math.random() + 3*level - 2.5));
}

function newEnemy(enemyNum) {
	enemies[enemyNum].x = Math.random() * (BG_WIDTH - (hero.w + 2*PADDING)) + PADDING + (hero.w - ENEMY_W) / 2;
	enemies[enemyNum].y = ENEMY_ENTER_POS;
	let overlap = true;
	while (noOfEnemies > 1 && overlap) {
		for (let i=0; i<noOfEnemies; i++) {
			if (i != enemyNum && enemies[i].y - enemies[enemyNum].y < ENEMY_H &&
				Math.abs(enemies[enemyNum].x - enemies[i].x) < ENEMY_W) {
				enemies[enemyNum].x = Math.random() *
									  (BG_WIDTH - (hero.w + 2*PADDING)) + PADDING + (hero.w - ENEMY_W) / 2;
				break;
			} else if (i == noOfEnemies - 1) {
				overlap = false;
			}
		}
	}
	if (level != 3 && level != 8)
		enemies[enemyNum].op = 1;
	else
		enemies[enemyNum].op = 0;
}

function fire() {
	fired = true;
	bullet.y -= bullet.h;
	bullet.style.top = bullet.y;
	bullet.style.visibility = "visible";
	let temp = Math.sqrt(BG_WIDTH * BG_WIDTH + BG_HEIGHT * BG_HEIGHT) / BULLET_MOVEMENT;
	let changeX = BULLET_MOVEMENT * Math.cos(((rotate - 90) * -3.14) / 180);
	let changeY = BULLET_MOVEMENT * Math.sin(((rotate - 90) * -3.14) / 180);
	if (changeX > 0 && changeX * temp > BG_WIDTH - bullet.x)
		temp = (BG_WIDTH - bullet.w - bullet.x) / changeX;
	else if (changeX < 0 && Math.abs(changeX) * temp > BG_WIDTH)
		temp = bullet.x / Math.abs(changeX);
	if (changeY * temp > bullet.y)
		temp = bullet.y / changeY;
	for (let i=0; i < temp; i++) {
		setTimeout(() => {
			bullet.y -= changeY;
			bullet.x += changeX;
		}, 10*i);
	}
	setTimeout(() => {
		bullet.style.visibility = "hidden";
		bullet.y = hero.y;
		bullet.x = hero.x + (hero.w - bullet.w) / 2;
		fired = false;
	}, 10 * temp);
}

function mysteryHit(enemyNum) {
	if (killCount == bonus - 1) {
		mysteryKill = enemyNum;
		enemies[enemyNum].style.backgroundImage = "url('images/mystery.png')";
		radarEnemies[enemyNum].style.backgroundImage = "url('images/mysterySmall.png')";
		mysteryPassed = false;
		setTimeout(() => {
			enemies[enemyNum].style.backgroundImage = "url('images/enemy.png')";
			radarEnemies[enemyNum].style.backgroundImage = "url('images/enemySmall.png')";
			mysteryPassed = true;
		}, 10 * ((EXIT_POS - ENEMY_ENTER_POS) / (MAX_ENEMY_MOVEMENT / 30)));
	} else {
		mysteryPassed = true;
		enemies[mysteryKill].style.backgroundImage = "url('images/enemy.png')";
		radarEnemies[mysteryKill].style.backgroundImage = "url('images/enemySmall.png')";
		let switcher = Math.random();
		let livesInt = parseInt(lives.innerHTML);
		let passedInt = parseInt(passed.innerHTML);
		levelShow.style.visibility = "visible";
		if (switcher < 0.75 || level > 7) {
			if (level < 8 && livesInt <= LIVES_AT_START / 3 && Math.random() > 0.7) {
				lives.innerHTML = livesInt + 2;
				levelShow.innerHTML = "Lives: +2";
			} else if (level < 8 && passedInt >= 0.7 * MAX_ENEMY_PASSES && Math.random() > 0.7) {
				passed.innerHTML = passedInt - 5;
				levelShow.innerHTML = "Enemies Passed: -5";
			} else if ((level < 8 && level != 3 && switcher > 0.4) || ((level == 6 || level == 7) && Math.random() > 0.5)) {
				levelShow.innerHTML = "Slo Mo Enemies!";
				let temp = MAX_ENEMY_MOVEMENT;
				let s = MAX_ENEMY_MOVEMENT - MIN_ENEMY_MOVEMENT;
				MAX_ENEMY_MOVEMENT = MIN_ENEMY_MOVEMENT;
				for (let i=0; i < s; i++) {
					setTimeout(() => {
						MAX_ENEMY_MOVEMENT++;
					}, 3000 + 3000 * i / s);
				}
			} else if (level > 5 || switcher > 0.15) {
				levelShow.innerHTML = "Super Fast Bullets!";
				let temp = BULLET_MOVEMENT;
				BULLET_MOVEMENT *= 3;
				setTimeout(() => {
					BULLET_MOVEMENT /= 3;
				}, 12000 / (noOfEnemies + 1));
			} else {
				let scoreInt = parseInt(score.innerHTML);
				score.innerHTML = scoreInt * 2;
				levelShow.innerHTML = "Score: 2x";
			}
		} else {
			levelShow.style.color = "red";
			if (level == 3) {
				levelShow.innerHTML = "Radar Invisible Enemies!";
				for (let i=0; i<noOfEnemies; i++) {
					radarEnemies[i].style.visibility = "hidden";
				}
				setTimeout(() => {
					for (let i=0; i<noOfEnemies; i++) {
						radarEnemies[i].style.visibility = "visible";
					}
				}, 9000);
			} else if (livesInt >= LIVES_AT_START * 4 / 5 && Math.random() < 0.5) {
				lives.innerHTML = livesInt - 1;
				levelShow.innerHTML = "Lives: -1";
			} else if (passedInt <= MAX_ENEMY_PASSES / 5 && Math.random() < 0.5) {
				passed.innerHTML = passedInt + 3;
				levelShow.innerHTML = "Enemies Passed: +3";
			} else if (switcher > 0.93) {
				levelShow.innerHTML = "Faster Enemies!";
				let temp = MAX_ENEMY_MOVEMENT;
				let s = MAX_ENEMY_MOVEMENT - MIN_ENEMY_MOVEMENT;
				MIN_ENEMY_MOVEMENT += MAX_ENEMY_MOVEMENT / 2;
				MAX_ENEMY_MOVEMENT *= 1.5;
				setTimeout(() => {
					MAX_ENEMY_MOVEMENT /= 1.5;
					MIN_ENEMY_MOVEMENT = MAX_ENEMY_MOVEMENT - s;
				}, 12000 / (noOfEnemies + 1));
			} else if (switcher > 0.83) {
				levelShow.innerHTML = "Slow Bullets!";
				let temp = BULLET_MOVEMENT;
				BULLET_MOVEMENT /= 2;
				setTimeout(() => {
					BULLET_MOVEMENT *= 2;
				}, 12000 / (noOfEnemies + 1));
			} else {
				levelShow.innerHTML = "Slow Hero!";
				let temp = HERO_MOVEMENT;
				HERO_MOVEMENT /= 2;
				setTimeout(() => {
					HERO_MOVEMENT *= 2;
				}, 12000 / (noOfEnemies + 1));
			}
		}
		setTimeout(() => {
			levelShow.style.visibility = "hidden";
			levelShow.style.color = "green";
		}, 1500);
	}
}

function detectCollision(element) {
	for (let i=0; i<noOfEnemies; i++) {
		if (enemies[i].y < element.y + element.h && enemies[i].y + ENEMY_H > element.y &&
			enemies[i].x - element.w < element.x && element.x < enemies[i].x + ENEMY_W) {
			deadBravo.style.visibility = "visible";
			if (element == bullet) {
				let scoreInt = parseInt(score.innerHTML);
				let hitType = 2;
				let temp = Math.abs(element.x - enemies[i].x + (element.w - ENEMY_W) / 2);
				let temp2 = (element.w + ENEMY_W) / 2;
				if (Math.abs(rotate) >= 15 || temp <= temp2 / 4)
					hitType = 5;
				else if (temp < (temp2 * 3) / 4)
					hitType = 3;
				let addScore = hitType * (5 + killCount);
				scoreInt += addScore;
				score.innerHTML = scoreInt;
				let killedInt = parseInt(killed.innerHTML);
				killed.innerHTML = killedInt + 1;
				deadBravo.style.color = "blue";
				deadBravo.innerHTML = "+" + addScore;
				killCount++;
				if (level > 1 && ((!mysteryPassed && i == mysteryKill) || killCount == bonus - 1)) {
					mysteryHit(i);
				}
				let s = MAX_ENEMY_MOVEMENT - MIN_ENEMY_MOVEMENT;
				for (let j=1; j<8; j++) {
					if (killCount == s * j / 2) {
						levelUp();
						return;
					}
				}
			} else if (element == hero && level < 8) {
				let livesInt = parseInt(lives.innerHTML);
				livesInt--;
				lives.innerHTML = livesInt;
				if (livesInt < 1)
					over = true;
				deadBravo.style.color = "red";
				deadBravo.innerHTML = "DEAD!";
			}
			newEnemy(i);
			setTimeout(() => {
				deadBravo.style.visibility = "hidden";
			}, 500);
		}
	}
}

function drawHero(){
	hero.style.left = hero.x;
}

function drawBullet(){
	bullet.style.left = bullet.x;
	bullet.style.top = bullet.y;
	if (bullet.x <= bullet.w || bullet.x >= BG_WIDTH - bullet.w) {
		bullet.style.visibility = "hidden";
	}
}

function drawEnemy(){
	for (let i=0; i<noOfEnemies; i++) {
		enemies[i].style.left = enemies[i].x;
		enemies[i].style.top = enemies[i].y;
	}
	for (let i=0; i<noOfEnemies; i++) {
		if (enemies[i].y < EXIT_POS) {
			if (level == 1) {
				enemies[i].y += (MIN_ENEMY_MOVEMENT + killCount * 2) / 30;
			} else {
				let changeY = (MAX_ENEMY_MOVEMENT) / 30;
				enemies[i].y += changeY;
				if (level == 2 || level == 5 || level == 7)
					enemies[i].op -= (1.5 * changeY) / (EXIT_POS - ENEMY_ENTER_POS);
				else if ((level == 3 || level == 8) && enemies[i].y >= (EXIT_POS - ENEMY_ENTER_POS) / 3)
					enemies[i].op += (1.5 * changeY) / (EXIT_POS - ENEMY_ENTER_POS);
				enemies[i].style.opacity = enemies[i].op;
			}
		} else {
			newEnemy(i);
			if (level < 8) {
				let passedInt = parseInt(passed.innerHTML);
				passed.innerHTML = passedInt + 1;
				if (passedInt + 1 >= MAX_ENEMY_PASSES)
					over = true;
			}
		}
	}
}

function handleControls(){
	if (spaceKeyPressed) {
		if (bullet.y == hero.y) {
			fire();
		}
	}
	if (ctrlKeyPressed) {
		if (leftKeyPressed) {
			if (rotate > -60) {
				rotate -= 3;
				hero.style.transform = "rotate(" + rotate + "deg)";
				bullet.style.transform = "rotate(" + rotate + "deg)";
			}
		}
		if (rightKeyPressed) {
			if (rotate < 60) {
				rotate += 3;
				hero.style.transform = "rotate(" + rotate + "deg)";
				bullet.style.transform = "rotate(" + rotate + "deg)";
			}
		}
	} else {
		if (leftKeyPressed && hero.x > PADDING + HERO_MOVEMENT) {
			hero.x -= HERO_MOVEMENT;
			if (!fired)
				bullet.x -= HERO_MOVEMENT;
		}
		if (rightKeyPressed && hero.x < BG_WIDTH - (PADDING + hero.w + HERO_MOVEMENT)) {
			hero.x += HERO_MOVEMENT;
			if (!fired)
				bullet.x += HERO_MOVEMENT;
		}
	}
	if (upKeyPressed) {
		hero.style.transform = "rotate(0deg)";
		bullet.style.transform = "rotate(0deg)";
		rotate = 0;
	}
}

function updateRadar() {
	radarHero.style.left = hero.x / 5;
	radarHero.style.top = hero.y / 5;
	radarHero.style.transform = "rotate(" + rotate + "deg)";
	radarBullet.style.visibility = bullet.style.visibility;
	radarBullet.style.left = bullet.x / 5;
	radarBullet.style.top = bullet.y / 5;
	radarBullet.style.transform = "rotate(" + rotate + "deg)";
	for (let i=0; i<noOfEnemies; i++) {
		radarEnemies[i].style.left = enemies[i].x / 5;
		radarEnemies[i].style.top = enemies[i].y / 5;
		radarEnemies[i].style.opacity = Math.abs(1 - (enemies[i].y % (EXIT_POS / 3)) / (EXIT_POS / 6));
	}
}

function showSprites(){
	updateRadar();
	drawHero();
	drawBullet();
	drawEnemy();
}

function gameOver() {
	let livesInt = parseInt(lives.innerHTML);
	let passedInt = parseInt(passed.innerHTML);
	deadBravo.style.visibility = "visible";
	deadBravo.style.top = "180";
	bullet.style.visibility = "hidden";
	radarBullet.style.visibility = "hidden";
	for (let i=0; i<noOfEnemies; i++) {
		enemies[i].style.visibility = "hidden";
		radarEnemies[i].style.visibility = "hidden";
	}
	let time2 = "";
	let timeBonus = 0;
	let extra = 1000 * livesInt + 150 * (MAX_ENEMY_PASSES - passedInt) + 500 * level;
	let e;
	if (livesInt <= 0 || passedInt >= MAX_ENEMY_PASSES) {
		deadBravo.style.color = "red";
		e = "GAME OVER!";
	} else {
		if (time < 185) {
			timeBonus = (185 - time) * 1000;
			time2 = "<br/>Time: " + timeBonus;
		}
		deadBravo.style.color = "blue";
		e = "YOU WON COLONEL!";
		extra += 30000;
	}
	let totalScore = parseInt(score.innerHTML) + timeBonus + extra;
	deadBravo.innerHTML = e + "<br/>Score: " + score.innerHTML +
	                          "<br/>Kills: " + killCount +
	                          time2 + 
	                          "<br/>Extra: " + extra +
	                          "<br/>Total Score: " + totalScore;
}

function toggleKey(keyCode, isPressed) {
	switch (keyCode) {
		case CTRL_KEY:
			ctrlKeyPressed = isPressed;
			break;
		case SPACE_KEY:
			spaceKeyPressed = isPressed;
			break;
		case UP_KEY:
			upKeyPressed = isPressed;
			break;
		case LEFT_KEY:
			leftKeyPressed = isPressed;
			break;
		case RIGHT_KEY:
			rightKeyPressed = isPressed; 
			break;
	}
}

function listen() {
	if (!over) {
		handleControls();
		detectCollision(hero);
		detectCollision(bullet);
		showSprites();
	} else {
		gameOver();
	}
}

document.onkeydown = evt => {
	toggleKey(evt.keyCode, true);
};

document.onkeyup = evt => {
	toggleKey(evt.keyCode, false);
};