// RequestAnimFrame: a browser API for getting smooth animations
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
    window.setTimeout(callback, 1000 / 60);
};
})();
//Global Variable
//Canvas Variable
var canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
var width = 480;
	height = 600;
	canvas.width = width;
	canvas.height = height;

//Variables for game
var platforms = [],
	gambar = document.getElementById("sprite"),
	pemain, platformCount = 10,
	posisi = 0,
	gravitasi = 0.2,
	animloop,
	flag = 0,
	menuloop, broken = 0,
	dir, score = 0, level = "Kiddy", firstRun = true;
	
//Base object
var Base = function(){
	this.height = 5;
	this.width = width;
	//Pemotongan Sprite / //Sprite clipping
	this.cx = 0;
	this.cy = 65;
	this.cwidth = 100;
	this.cheight = 614;
	this.moved = 0;
	this.x = 0;
	this.y = height - this.height;
	this.gambar = function(){ 
		try {
			ctx.drawImage(gambar, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
		} 	
		catch (e) {}
	};
};
var base = new Base();

//Objek Pemain / Player Object
var Pemain = function(){
	this.vy = 11;//posisi vertikal y awal pemain
	this.vx = 0;//posisi vertikal x awal pemain
	this.pindahKeKiri = false; //isMovingLeft
	this.pindahKeKanan = false; //isMovingRight
	this.Mati = false; //isDied
	this.width = 60;//lebar karakter
	this.height = 45;//tinggi karakter
	//Sprite Idle
	this.cx = 0; //posisi x sprite paling atas
	this.cy = 0; //posisi y sprite paling atas
	this.cwidth = 110; //lebar posisi sprite pemain
	this.cheight = 80; //tinggi posisi sprite pemain
	this.dir = "kiri";
	this.x = width / 2 - this.width / 2;
	this.y = height;
	//Fungsi untuk menggambarnya
	this.gambar = function() {
		try {
		if (this.dir == "kanan") this.cy = 121; //koordinat posisi x sprite pemain pada gambar idle
		else if (this.dir == "kiri") this.cy = 201;//koordinat posisi y sprite pemain pada gambar idle
		else if (this.dir == "kanan_land") this.cy = 289;//koordinat posisi x sprite gambar pemain ketika collision
		else if (this.dir == "kiri_land") this.cy = 371;//koordinat posisi y sprite gambar pemain ketika collision
		ctx.drawImage(gambar, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
		} catch (e) {}
	};
	this.lompat = function() {
		this.vy = -8;
	};
	this.lompatTinggi = function() {
		this.vy = -15;
	};
};
pemain = new Pemain();

//Class Function Platform
function Platform(){
	this.width = 70;
	this.height = 18;
	this.x = Math.random() * (width - this.width);
	this.y = posisi;
	posisi += (height / platformCount);
	this.flag = 0;
	this.state = 0;
	//Sprite pengguntingan
	this.cx = 0;
	this.cy = 0;
	this.cwidth = 105;
	this.cheight = 31;
	//Fungsi untuk menggambar
	this.gambar = function() {
		try {
			if (this.type == 1) this.cy = 0;
			else if (this.type == 2) this.cy = 61;
			else if (this.type == 3 && this.flag === 0) this.cy = 31;
			else if (this.type == 3 && this.flag == 1) this.cy = 1000;
			else if (this.type == 4 && this.state === 0) this.cy = 89;
			else if (this.type == 4 && this.state == 1) this.cy = 1000;
			ctx.drawImage(gambar, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
		} catch (e) {}
	};
//Platform types
//1: Normal
//2: Moving
//3: Breakable (Go through)
//4: Vanishable 
//Mengatur kemungkinan tipe platform yang mana yang seharusnya dilihat pada suatu score
//Setting the probability of which type of platforms should be shown at what score
	if (score >= 1000001) this.types = [3,3,4,3,3];
	else if (score >= 95000 ) this.types = [4,4,3,3,4,4];
	else if (score >= 75000 ) this.types = [4,2,3,3,4];
	else if (score >= 60000 ) this.types = [2,4];
	else if (score >= 50000 ) this.types = [4,3,,2,4];
	else if (score >= 45000 ) this.types = [2,3,4,3,2];
	else if (score >= 40000 ) this.types = [1,2,3,4,3,2];
	else if (score >= 35000 ) this.types = [1,2,3,4,3,2,1];
	else if (score >= 30000 ) this.types = [2,3];
	else if (score >= 25000 ) this.types = [2,3,2];
	else if (score >=  22500) this.types = [2,3,2,3];
	else if (score >=  20000) this.types = [2,2,2,3,3,3];
	else if (score >=  17500) this.types = [1,2,3,1,2,3];
	else if (score >=  15000) this.types = [2];
	else if (score >=  12500) this.types = [1,2];
	else if (score >=  10000) this.types = [2,2,1];
	else if (score >=  7500) this.types = [1,2,1,2];
	else if (score >=  5000) this.types = [1,2,1,2,2];
	else if (score >=  2500) this.types = [1,2,2,1,2];
	else if (score >=  1000) this.types = [1,1,1];
	else this.types = [1,1];
	//Akhir kondisi
	this.type = this.types[Math.floor(Math.random() * this.types.length)];
//We can't have two consecutive breakable platforms otherwise it will be impossible to reach another platform sometimes!
	if (this.type == 3 && broken < 1) {
		broken++;
	} 
	else if (this.type == 3 && broken >= 1) {
		this.type = 1;
		broken = 0;
	}
		this.moved = 0;
		this.vx = 1;
}
for (var i = 0; i < platformCount; i++) {
	platforms.push(new Platform());
}

//Objek Platform patah / Broken platform object
var Platform_broken_substitute = function() {
	this.height = 30;
	this.width = 70;
	this.x = 0;
	this.y = 0;
	//Pengguntingan Sprite
	this.cx = 0;
	this.cy = 554;
	this.cwidth = 105;
	this.cheight = 60;
	this.appearance = false;
	this.gambar = function() {
		try {
		if (this.appearance === true) ctx.drawImage(gambar, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
		else return;
		}
		catch (e) {}
	};
};
var platform_broken_substitute = new Platform_broken_substitute();

//Spring / Spring Class
var spring = function() {
	this.x = 0;
	this.y = 0;
	this.width = 26;
	this.height = 30;
//Pengguntingan gambar Sprite
	this.cx = 0;
	this.cy = 0;
	this.cwidth = 45;
	this.cheight = 53;
	this.state = 0;
	this.gambar = function() {
    try {
		if (this.state === 0) this.cy = 445;
		else if (this.state == 1) this.cy = 501;
		ctx.drawImage(gambar, this.cx, this.cy, this.cwidth, this.cheight, this.x, this.y, this.width, this.height);
    } 
	catch (e) {}
	};
};
var Spring = new spring();
//Init Function Class untuk memulai game
function init(){
	//Variables for the game
	var dir = "kiri",
	lompatCount = 0;
  	firstRun = false;
	//Fungsi untuk membersihkan kanvas di setiap frame konsekutif
	function paintCanvas(){
		ctx.clearRect(0, 0, width, height);
	}
	//Pemain merelasikan kalkulasi dan fungsi
	function pemainCalc(){
		if (dir == "kiri") {
			pemain.dir = "kiri";
			if (pemain.vy < -7 && pemain.vy > -15) pemain.dir = "kiri_land";
		} 
		else if (dir == "kanan") {
			pemain.dir = "kanan";
			if (pemain.vy < -7 && pemain.vy > -15) pemain.dir = "kanan_land";
		}
		//Menambahkan Kontrol pada Keyboard/ Adding keyboard controls
		// helpers
		//Fungsi ketika tombol ditekan
		document.onkeydown = function(e) {
			var tombol = e.keyCode;
			if (tombol == 37) {
				dir = "kiri";
				pemain.pindahKeKiri = true;
			} 
			else if (tombol == 39) {
				dir = "kanan";
				pemain.pindahKeKanan = true;
			}
			if(tombol == 32) {
				if(firstRun === true)
					init();
				else 
					reset();
			}
		};
		//Fungsi ketika tombol dilepas
		document.onkeyup = function(e) {
			var tombol = e.keyCode;
			if (tombol == 37) {
				dir = "kiri";
				pemain.pindahKeKiri = false;
			} 
			else if (tombol == 39){
				dir = "kanan";
				pemain.pindahKeKanan = false;
			}
		};
		//Menghasilkan Percepatan ketika pengguna memegang kunci-kunci / Accelerations produces when the user hold the keys
		//LeftArrow
		if (pemain.pindahKeKiri === true) {
			pemain.x += pemain.vx;
			pemain.vx -= 0.15;
		} 
		else {
			pemain.x += pemain.vx;
			if (pemain.vx < 0) pemain.vx += 0.1;
		}
		//RightArrow
		if (pemain.pindahKeKanan === true){
			pemain.x += pemain.vx;
			pemain.vx += 0.15;
		} 
		else {
			pemain.x += pemain.vx;
			if (pemain.vx > 0) pemain.vx -= 0.1;
		}
		// Batas Kecepatan / Speed limits!
		if(pemain.vx > 8)
			pemain.vx = 8;
		else if(pemain.vx < -8)
			pemain.vx = -8;
		//console.log(pemain.vx);
		//Lompatan pemain ketika menyentuh pijakannya.
		if ((pemain.y + pemain.height) > base.y && base.y < height) pemain.lompat();
		//Gameover if it hits the bottom 
		if (base.y > height && (pemain.y + pemain.height) > height && pemain.Mati != "lol") pemain.Mati = true;
		//Make the pemain move through walls
		if (pemain.x > width) pemain.x = 0 - pemain.width;
		else if (pemain.x < 0 - pemain.width) pemain.x = width;
		//Movement of pemain affected by gravitasi
		if (pemain.y >= (height / 2) - (pemain.height / 2)) {
			pemain.y += pemain.vy;
			pemain.vy += gravitasi;
		}
		//When the pemain reaches half height, move the platforms to create the illusion of scrolling and recreate the platforms that are out of viewport...
		else {
			platforms.forEach(function(p, i) {
				if (pemain.vy < 0) {
					p.y -= pemain.vy;
				}
				if (p.y > height) {
					platforms[i] = new Platform();
					platforms[i].y = p.y - height;
				}
			});
		base.y -= pemain.vy;
		pemain.vy += gravitasi;
		if (pemain.vy >= 0) {
			pemain.y += pemain.vy;
			pemain.vy += gravitasi;
		}	
			score++;
		}
		//Make the pemain lompat when it collides with platforms
		collides();
		if (pemain.Mati === true) gameOver();
	}
	//Spring algorithms
	//fungsi untuk menaruh tempat spring
	function springCalc() {
		var s = Spring;
		var p = platforms[0];
		if (p.type == 1 || p.type == 2 || p.type == 3 ){
			s.x = p.x + p.width / 2 - s.width / 2;
			s.y = p.y - p.height - 10;
			if (s.y > height / 1.1) s.state = 0;
			s.gambar();
		} 
		else {
			s.x = 0 - s.width;
			s.y = 0 - s.height;
		}
	}
	//Platform's horizontal movement (and falling) algo
	function platformCalc(){
		var subs = platform_broken_substitute;
		platforms.forEach(function(p, i){
			if (p.type == 2) {
				if (p.x < 0 || p.x + p.width > width) p.vx *= -2;
				p.x += p.vx;
			}
			if (p.flag == 1 && subs.appearance === false && lompatCount === 0) {
				subs.x = p.x;
				subs.y = p.y;
				subs.appearance = true;
				lompatCount++;
			}
			p.gambar();
		});
		if (subs.appearance === true) {
			subs.gambar();
			subs.y += 8;
		}
		if (subs.y > height) subs.appearance = false;
	}
	//Collision Detection Function
	function collides() {
		//Platforms
		platforms.forEach(function(p, i) {
			if (pemain.vy > 0 && p.state === 0 && (pemain.x + 15 < p.x + p.width) && (pemain.x + pemain.width - 15 > p.x) && (pemain.y + pemain.height > p.y) && (pemain.y + pemain.height < p.y + p.height)) {
				if (p.type == 3 && p.flag === 0) {
					p.flag = 1;
					lompatCount = 0;					
					score += 750;
					return;
				} 
				else if (p.type == 4 && p.state === 0) {
					pemain.lompat();
					p.state = 1;
				} 
				else if (p.flag == 1) return;
				else {
					pemain.lompat();
				}
			}
		});
		//Spring / Spring
		var s = Spring;
		if (pemain.vy > 0 && (s.state === 0) && (pemain.x + 15 < s.x + s.width) && (pemain.x + pemain.width - 15 > s.x) && (pemain.y + pemain.height > s.y) && (pemain.y + pemain.height < s.y + s.height)) {
			s.state = 1;
			pemain.lompatTinggi();
		}
	}
	//Fungsi untuk menambah skor	
	function updateSkor() {
		var skorText = document.getElementById("score");
		skorText.innerHTML = 'Score Kamu: '+score;
	}
	//Fungsi untuk menambah level
	function updateLevel() {
		var levelText = document.getElementById("level");	
		if (score >= 100001) {level="Cheater";}
		else if (score >= 95000 ){level = "Superrr!!";}
		else if (score >= 75000 ){level = "Cool";}
		else if (score >= 60000 ){level = "Awesome";}
		else if (score >= 50000 ) {level = "Advance 5";}
		else if (score >= 45000 ) {level = "Advance 4";}
		else if (score >= 40000 ) {level = "Advance 3";} 
		else if (score >= 35000 ) {level = "Advance 2";}
		else if (score >= 30000 ) {level = "Advance 1";} 
		else if (score >= 25000 ) {level = "Intermediate 5";}
		else if (score >=  22500) {level = "Intermediate 4";}
		else if (score >=  20000) {level = "Intermediate 3";}
		else if (score >=  17500) {level = "Intermediate 2";}
		else if (score >=  15000) {level = "Intermediate 1";}
		else if (score >=  12500) {level = "Beginner 5";}	
		else if (score >=  10000) {level = "Beginner 4";}
		else if (score >=  7500) {level = "Beginner 3";}
		else if (score >=  5000) {level = "Beginner 2";}
		else if (score >=  2500) {level = "Beginner 1";}
		else if (score >=  1000) {level = "Wanna be";}
		levelText.innerHTML = 'Level Kamu: '+level;
	}
	//Fungsi ketika Game Over  
	function gameOver() {
		platforms.forEach(function(p, i) {
			p.y -= 12;
		});
		if(pemain.y > height/2 && flag === 0) {
			pemain.y -= 8;
			pemain.vy = 0;
		} 
		else if(pemain.y < height / 2) flag = 1;
		else if(pemain.y + pemain.height > height) {
			showGoMenu();
			hideScore();
			pemain.Mati = "lol";
		var tweet = document.getElementById("tweetBtn");
			tweet.href='http://twitter.com/share?url=http://game.maulanamalikibrahim.info&text=I just scored ' +score+ ' points and reached level'+level+' in the HTML5 Pak Raden Jump game!';
		var facebook = document.getElementById("fbBtn");
			facebook.href='http://facebook.com/sharer.php?s=100&p[url]=http://game.maulanamalikibrahim.info&p[title]=My scored just scored' +score+ ' points and reached level'+level+' in the HTML5 Pak Raden Jump game!&p[summary]=Can you beat me in this awesome Game?';
		}
	}
	//Fungsi untuk mengupdate semuanya / Function to update everything
	function update(){
		paintCanvas();
		platformCalc();
		springCalc();
		pemainCalc();
		pemain.gambar();
		base.gambar();
		updateSkor();
		updateLevel();
	}
	menuLoop = function(){return;};
	animloop = function() {
		update();
		requestAnimFrame(animloop);
	};
animloop();
hideMenu();
showScore();
}

//Fungsi reset
function reset() {
	hideGoMenu();
	showScore();
	pemain.Mati = false;
  	flag = 0;
	posisi = 0;
	score = 0;
	level = "Kiddy";
	base = new Base();
	pemain = new Pemain();
	Spring = new spring();
	platform_broken_substitute = new Platform_broken_substitute();
	platforms = [];
	for (var i = 0; i < platformCount; i++) {
		platforms.push(new Platform());
	}
}

//Fungsi menyembunyikan Menu / Hides the menu
function hideMenu() {
	var menu = document.getElementById("mainMenu");
	menu.style.zIndex = -1;
}

//Menampilkan Menu Game Over / Shows the game over menu
function showGoMenu() {
	var menu = document.getElementById("gameOverMenu");
	menu.style.zIndex = 1;
	menu.style.visibility = "visible";
	var skorText = document.getElementById("go_score");
	if (score >= 100001) skorText.innerHTML = "Damn you are cheater, Kill yourself,<br> you are like a shit, your fucking points is Fucking NULL!!!";
	else if (score >= 95000 && score < 100001) skorText.innerHTML = "You are Superrr!!!,<br> your Score is " + score + " points, Semangat!";
	else if (score >= 75000 && score < 95000) skorText.innerHTML = "You are cool coy,<br> your Score is " + score + " points, Semangat!";
	else if (score >= 60000 && score < 75000) skorText.innerHTML = "You are Awesome man,<br> your Score is " + score + " points, Semangat!";
	else if (score >= 50000 && score < 60000) skorText.innerHTML = "You are a Advance level 5 Now ,<br>your score is <br>" + score + " points, Semangat!";
	else if (score >= 45000 && score < 50000) skorText.innerHTML = "You are a Advance level 4 Now ,<br>your score is " + score + " points, Semangat!";
	else if (score >= 40000 && score < 45000) skorText.innerHTML = "You are a Advance level 3 Now ,<br>your score is " + score + " points, Semangat!";
	else if (score >= 35000 && score < 40000) skorText.innerHTML = "You are a Advance level 2 Now ,<br>your score is " + score + " points, Semangat!";
	else if (score >= 30000 && score < 35000) skorText.innerHTML = "Selamat !!!, You are in Advance level 1 Now ,<br>your score " + score + " points, Semangat!";
	else if (score >= 25000 && score < 30000) skorText.innerHTML = "You are a Intermediate level 5 Now ,<br>your score is " + score + " points!, Semangat!";
	else if (score >= 22500 && score < 25000) skorText.innerHTML = "You are a Intermediate level 4 Now ,<br>your score is " + score + " points!, Semangat!";
	else if (score >= 20000 && score < 22500) skorText.innerHTML = "You are a Intermediate level 3 Now ,<br>your score is " + score + " points, Semangat!";
	else if (score >= 17500 && score < 20000) skorText.innerHTML = "You are a Intermediate level 2 Now ,<br>your score is " + score + " points, Semangat!";
	else if (score >= 15000 && score < 17500) skorText.innerHTML = "Selamat !!!, You are in Intermediate level 1 Now ,<br>your score " + score + " points, Semangat!";
	else if (score >= 12500 && score < 15000) skorText.innerHTML = "You are a Beginner level 5 Now ,<br>your score is " + score + " points, Semangat!";
	else if (score >= 10000 && score < 12500) skorText.innerHTML = "You are a Beginner level 4 Now ,<br> your score is " + score + " points, Semangat!";
	else if (score >= 7500 && score < 10000) skorText.innerHTML = "You are a Beginner level 3 Now ,<br> your score is " + score + " points, Semangat!";
	else if (score >= 5000 && score < 7500) skorText.innerHTML = "You are a Beginner level 2 Now ,<br> your score is " + score + " points, Semangat!";
	else if (score >= 2500 && score < 5000) skorText.innerHTML = "Selamat !!!, You are in Beginner level 1 Now ,<br> your score is " + score + " points, Semangat!";
	else if (score >= 1000 && score < 2500) skorText.innerHTML = "Hhmm..., You have to learn more harder than now,<br> please your score just " + score + " points, Semangat!";
	else skorText.innerHTML = "Hey, -_- are you kidding me?,<br> Wake up! your score just <br>" + score + " points, Semangat!";
}

//Menyembunyikan Menu Game Over / Hides the game over menu
function hideGoMenu(){
	var menu = document.getElementById("gameOverMenu");
	menu.style.zIndex = -1;
	menu.style.visibility = "hidden";
}

//Menampilkan Score Board / Show ScoreBoard
function showScore(){
	var menu = document.getElementById("scoreBoard");
	menu.style.zIndex = 1;
}

//Menyembunyikan Score Board / Hide ScoreBoard
function hideScore(){
	var menu = document.getElementById("scoreBoard");
	menu.style.zIndex = -1;
}

//pemain melompat
function pemainLompat(){
	pemain.y += pemain.vy;
	pemain.vy += gravitasi;
	if 	(pemain.vy > 0 && (pemain.x + 15 < 260) && 
		(pemain.x + pemain.width - 15 > 155) && 
		(pemain.y + pemain.height > 475) && 
		(pemain.y + pemain.height < 500))
		pemain.lompat();
	if 	(dir == "kiri") {
		pemain.dir = "kiri";
		if 	(pemain.vy < -7 && pemain.vy > -15) pemain.dir = "kiri_land";
	}
	else if (dir == "kanan"){
		pemain.dir = "kanan";
		if (pemain.vy < -7 && pemain.vy > -15) pemain.dir = "kanan_land";
	}
	//Menambahkan Kontrol Keyboard / Adding keyboard controls
	document.onkeydown = function(e) {
		var tombol = e.keyCode;
		if (tombol == 37) {
			dir = "kiri";
			pemain.pindahKeKiri = true;
		} 
		else if (tombol == 39) {
			dir = "kanan";
			pemain.pindahKeKanan = true;
		}
		if(tombol == 32) {
			if(firstRun === true) {
				init();
				firstRun = false;
			}
			else 
				reset();
		}
	};
	document.onkeyup = function(e) {
		var tombol = e.keyCode;
		if (tombol == 37) {
			dir = "kiri";
			pemain.pindahKeKiri = false;
		} 
		else if (tombol == 39) {
			dir = "kanan";
			pemain.pindahKeKanan = false;
		}
	};
	//Accelerations produces when the user hold the keys
	if (pemain.pindahKeKiri === true) {
		pemain.x += pemain.vx;
		pemain.vx -= 0.15;
	}
	else {
		pemain.x += pemain.vx;
		if (pemain.vx < 0) pemain.vx += 0.1;
	}
	if (pemain.pindahKeKanan === true) {
		pemain.x += pemain.vx;
		pemain.vx += 0.15;
	}
	else {
		pemain.x += pemain.vx;
		if (pemain.vx > 0) pemain.vx -= 0.1;
	}
	//Pemain akan melompat ketika menyentuh base
	if ((pemain.y + pemain.height) > base.y && base.y < height) pemain.lompat();
	//Make the pemain move through walls
	if (pemain.x > width) pemain.x = 0 - pemain.width;
	else if (pemain.x < 0 - pemain.width) pemain.x = width;
	pemain.gambar();
}
function update() {
	ctx.clearRect(0, 0, width, height);
	pemainLompat();
}   
menuLoop = function() {
	update();
	requestAnimFrame(menuLoop);
};
menuLoop();