
alert("I found that the game was a bit difficult for all of us because I didn't give instructions and make balances so here they are... Bugs may be present I'm sorry! DEBUG MODE had been added and you can't get rid of it. Displays hitboxes so that people don't have to start questioning the game. Full Screen Mode does not support clicking so when activating full screen you automatically start the game and enter full screen to prevent delay from playing. Arrow Keys Left and Right to move left and right. Arrow Key Down to crouch which is good for reducing hitbox in certain situations but cannot jump when crouching to avoid abuse of small hitbox and Arrow Key Up / Space to jump. Play as Mr. Clark and defeat the Evil English Wizard to be rewarded by the Oracle of ELA!. Level 1 which is the Start and 20 secs long - Only fire orbs that you can crouch to / jump above. Level 2 which is after first sword and 40 secs long - Boss now shoots out spiraling fire orbs at a low chance and spawns green orbs which blind the player for 3 secs and gives +5 HP! Crouching is also your best chance against spiraling fire orbs. Level 3 which is after your second sword and 20 secs long - Boss now has tally bot tickerson that falls from the sky and come with a warning. Pay your tickets next time.");
try {
window.addEventListener("load",function() {

class EntitySetup 
{
    constructor(x,y,w,h) 
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    isTouching(a) 
    {
        return this.x <= a.x + a.w &&
        this.x + this.w >= a.x &&
        this.y <= a.y + a.h &&
        this.y + this.h >= a.y;
    }
}

class Entity extends EntitySetup 
{
    constructor(img,x,y,w,h,health,speed,direction) 
    {
        super(x,y,w,h);
        this.img = new Image();
        this.img.src = img;
        this.health = health;
        this.speed = speed;
        this.vy = 0;
        this.direction = direction;
        this.jumpCooldown = 0;
        this.originalH = h;
        this.crouched = false;
        this.alpha = 1;
        this.immunity = false;
        this.immunefor = 0;
    }
    draw() 
    {
        CTX.globalAlpha = this.alpha;
        CTX.drawImage(this.img,this.x,this.y,this.w,this.h);
        CTX.globalAlpha = 0.15;
        CTX.fillStyle = "green";
        CTX.fillRect(this.x,this.y,this.w,this.h);
        CTX.globalAlpha = 1;
    }
    handlePlayerImg() 
    {
        if (InputHandler.defaultObj.keys.indexOf("ArrowLeft") > -1) 
    {
        this.img.src = "left.webp";
    } else if (InputHandler.defaultObj.keys.indexOf("ArrowRight") > -1) 
    {
        this.img.src = "right.webp";
    } else 
    {
        this.img.src = "idle.webp";
    }
    }    
    update(keymovement) 
    {
    this.vy += 0.2;
    if (this.y + this.h > 490) 
    {
        this.vy = 0;
        this.y = 490 - this.h;
    }
    this.y += this.vy;
    if (!keymovement) return;
    if (InputHandler.defaultObj.keys.indexOf("ArrowLeft") > -1) 
    {
        this.x -= this.speed;
    } 
    if (InputHandler.defaultObj.keys.indexOf("ArrowRight") > -1) 
    {
        this.x += this.speed;
    }
    if (this.x < 0) 
    {
        this.x = 0;
    }
    if (this.x + this.w > WIDTH) 
    {
        this.x = WIDTH - this.w;
    }
    if ((InputHandler.defaultObj.keys.indexOf("Space") > -1 || InputHandler.defaultObj.keys.indexOf("ArrowUp") > -1 )&& this.y + this.h >= 490 && this.jumpCooldown <= 0 && !this.crouched) 
    {
        this.vy = -6.25;
        this.jumpCooldown = 0.5;
        this.y -= 2;
    }
    if (InputHandler.defaultObj.keys.indexOf("ArrowDown") > -1) 
    {
        this.crouch();
    } else 
    {
        this.h = this.originalH;
        this.crouched = false;
    }
    }
    crouch() 
    {
        if (!this.crouched) this.y = this.y + this.h/2;
        this.h = this.originalH / 2.5;
        this.crouched = true;
    }
}
const FULLSCREENBTN = document.querySelector("#FULLSCREEN");
const CANVAS = document.querySelector("#GAME_CANVAS");
class InputHandler 
{
    static defaultObj = new InputHandler();
    constructor() 
    {
        this.keys = [];
        this.mouse = 
        {
            x : 0,
            y : 0,
            clicked : false
        }

        window.addEventListener("keydown",
        (e)=>
        {
            if (this.keys.indexOf(e.code) === -1) this.keys.push(e.code);
        });
        window.addEventListener("keyup",
        (e)=>
        {
            if (this.keys.indexOf(e.code) > -1) this.keys.splice(this.keys.indexOf(e.code),1);
        });
        CANVAS.addEventListener("mousedown",(e)=>
        {
            let bounds = CANVAS.getBoundingClientRect();
            this.mouse.x = e.clientX - bounds.left;
            this.mouse.y = e.clientY - bounds.top;
            this.mouse.clicked = true;
        });
        CANVAS.addEventListener("mouseup",()=>
        {
            this.mouse.clicked = false;
        }); 
    }
}
const CTX = CANVAS.getContext("2d");
const WIDTH = CANVAS.width = 800;
const HEIGHT = CANVAS.height = 550;
let stage = 0;
FULLSCREENBTN.addEventListener("click",()=>
{
    CANVAS.requestFullscreen();
    stage = 1;
    resetGame();
});
const startScreenImg = new Image();
startScreenImg.src = "startscreen.png";
const caveScreenImg = new Image();
caveScreenImg.src = "cave.png";
const clarkImg = new Image();
clarkImg.src = "clark.jpg";
let olympus = new Image();
let oracle = new Image();
olympus.src = "olympus.jpeg";
oracle.src = "oracle.png";
let bossAttackRate = 1;
let cosEntities = [];
let sinEntities = [];
const player = new Entity("clark.jpg",20,-100,45,60,100,3,1);
const boss = new Entity("evilwizard.png",WIDTH-40,200,45,60,100,5,-1);
let easySwordSpawnInterval = 20;
let mediumSwordSpawnInterval = 40;
let difficultSwordSpawnInterval = 20;
let swordSpawnInterval = easySwordSpawnInterval;
let sword = new Entity("easysword.png",375,1000,50,65,1000,0,0);
let swordSpawned = false;
let playingMusic = false;
let startaudio = new Audio("start.mp3");
let playaudio = new Audio("play.mp3");
let winaudio = new Audio("win.mp3");
startaudio.preload = "auto";
playaudio.preload = "auto";
startaudio.volume = 0.25;
winaudio.preload = "auto";
let currentaudio = startaudio;
boss.mode = "easy";
boss.move2 = () => 
{
    if (boss.direction == -1) 
    {
        boss.x = 20;
    } else if (boss.direction == 1) 
    {
        boss.x = WIDTH - boss.w - 20;
    }
}
boss.attack = () => 
{
    let randomness = Math.random();
    if (Math.random() >= 0.25 && boss.mode == "difficult") 
    {
        let specialAttack = new Entity("fireorb.png",boss.x + boss.w/2,(boss.y),boss.w,boss.h,1000,5,boss.direction);
        specialAttack.cosVal = Math.random() * 180;
        cosEntities.push(specialAttack);
        if (Math.random() >= 0.5) 
        {
            sinEntities.push(specialAttack);
        }
        boss.orbs.push(specialAttack);
        return;
    } else if (Math.random() >= 0.5 &&(boss.mode === "medium")) 
    {
        let specialAttack = new Entity("fireorb.png",boss.x + boss.w/2,(boss.y),boss.w,boss.h,1000,5,boss.direction);
        specialAttack.cosVal = Math.random() * 360;
        cosEntities.push(specialAttack);
        boss.orbs.push(specialAttack);
        return;
    }
    boss.orbs.push(new Entity("fireorb.png",boss.x + boss.w/2,(boss.y - boss.h/2 + Math.random() * boss.h),boss.w,boss.h,1000,5,boss.direction));
}
bossMoveInterval = Math.random() * 15 + 15;
bossAttackInterval = Math.random() * 2 + 0.5;
let flybotinterval = 10;
boss.orbs = [];
let blindorbs = [];
let blindorbsinterval = 5;
let alphaEntities = [];
let flybot = new Entity("flybot.png",-200,0,170,185,0,0,0);

function gameIntervals() 
{
    if (blindorbsinterval <= 0 && (boss.mode === "difficult" || boss.mode === "medium")) 
    {
        blindorbs.push(new Entity("greenblast.png",Math.random() * 350 + 25,-150,50,50,1000,0,0));
        blindorbsinterval = 10;
    }
    if (flybotinterval <= 0 && boss.mode === "difficult") 
    {
        let randomX = Math.random() * 350 + 25;
        flybotinterval = 10;
        let dangerstripes = new Entity("dangerstripes.jpeg",randomX,0,170,HEIGHT*1.5,0,0,0);
        alphaEntities.push(dangerstripes)
        let danger = new Entity("danger.png",randomX + 65,200,50,50);
        alphaEntities.push(danger);
        setTimeout(()=>
        {
            flybot.y = -100;
            flybot.x = randomX;
        },1500);
    }
    if (bossMoveInterval <= 0) 
    {
        boss.move2();
        boss.direction *= -1;
        bossMoveInterval = Math.random() * 15 + 15;
        //bossMoveInterval = Math.random() * 15 + 15;
    }
    if (swordSpawnInterval <= 0 && !swordSpawned) 
    {
        sword.y = -50;
        sword.x = Math.random() * 200 + 100;
        swordSpawned = true;
    }
    if (bossAttackInterval <= 0) 
    {
        boss.attack();
        bossAttackInterval = Math.random() * 2 + bossAttackRate;
    }
}

function resetGame() 
{
    playingMusic = false;
    stage = 1;
    boss.y = -100;
    boss.orbs = [];       
    boss.x = WIDTH - boss.w - 20;
    bossMoveInterval = Math.random() * 15 + 15; 
    boss.direction = -1;
    blindorbs = [];
    cosEntities = [];
    alphaEntities = [];
    sword.img.src = "easysword.png";
    sword.x = -100;
    player.x = 20;
    player.direction = -1;
    boss.mode = "easy";
    boss.health = 300;
    sinEntities = [];
    bossAttackRate = 1;
    swordSpawnInterval = easySwordSpawnInterval;
    flybot.x = -200;
    player.y = -100;
    flybotinterval = 10;
}

function gameLogic() 
{
    for (let entity of cosEntities) 
    {
        entity.y = entity.y + Math.cos(entity.cosVal/20) * 6;
        entity.cosVal += 2;
    }
    for (let orb of boss.orbs) 
    {
        orb.x += orb.speed * orb.direction;
        orb.draw();
        if (orb.isTouching(player) && !player.immune) 
        {
            player.health -= 34;
            boss.orbs.splice(boss.orbs.indexOf(orb),1);
            player.immunefor = 3;
        }
    }
    for (let orb of blindorbs) 
    {
        if (player.isTouching(orb)) 
        {
            blindorbs.splice(blindorbs.indexOf(orb),1);
            let newThingie = new Entity("ashbaby.jpeg",0,0,WIDTH,HEIGHT,0,0,0);
            alphaEntities.push(newThingie);
            player.health += 5;
        }
        orb.update();
        orb.draw();
    }
    for (let entity of alphaEntities) 
    {
        if (entity.alpha <= 0) {
            alphaEntities.splice(alphaEntities.indexOf(entity),1);
            return;
        }
        entity.draw();
    }
}

function startScreen() 
{
    CTX.globalAlpha = 1;
    CTX.drawImage(startScreenImg,0,0,WIDTH,HEIGHT);
    //170 & 300
    if (InputHandler.defaultObj.mouse.clicked
        && InputHandler.defaultObj.mouse.x > 264 && InputHandler.defaultObj.mouse.y > 426 &&
        InputHandler.defaultObj.mouse.x < 264 + 240 && InputHandler.defaultObj.mouse.y < 426 + 55
    ) 
    {
        resetGame();
    }
}

function decisecond() 
{
    player.immunefor -= 0.1;
    bossMoveInterval -= 0.1;
    bossAttackInterval -= 0.1;
    player.jumpCooldown -= 0.1;
    blindorbsinterval -= 0.1;
    swordSpawnInterval -= 0.1;
    flybotinterval -= 0.1;
    for (let entity of alphaEntities)
    {
        entity.alpha -= 0.05;
    }
} setInterval(decisecond,100);

function fightScreen() 
{
    if (player.health > 100) 
    {
        player.health = 100;
    }
    if (boss.health <= 0) 
    {
        stage = 2;
        playingMusic = false;
    }
    player.immune = player.immunefor > 0 ? true : false;
    if (player.immune) 
    {
        player.alpha = 0.35;
    } else 
    {
        player.alpha = 1;
    }
    CTX.globalAlpha = 1;
    CTX.drawImage(caveScreenImg,0,0,WIDTH,HEIGHT);
    player.handlePlayerImg();
    player.update(true);
    player.draw();
    boss.draw();
    boss.update();
    sword.draw();
    flybot.y += 4;
    flybot.draw();
    gameIntervals();
    gameLogic();

    if (swordSpawned) sword.update();
    if (flybot.isTouching(player) && player.immunefor <= 0) 
    {
        player.health -= 50;
        flybot.x = 1000;
        player.immunefor = 5;

    }
    if (player.isTouching(sword)) 
    {
        sword.y = 1000;
        player.health += 25;
        boss.health -= 100;
        swordSpawned = false;
        switch(boss.mode) 
        {
            case "easy":
                sword.img.src = "mediumsword.png";
                swordSpawnInterval = mediumSwordSpawnInterval;
                boss.mode = "medium";
                break;
            case "medium":
                sword.img.src = "difficultsword.png";
                swordSpawnInterval = difficultSwordSpawnInterval;
                boss.mode = "difficult";
                bossAttackRate = 0.75;
                break;
            case "difficult":
                sword.img.src = "easysword.png";
                swordSpawnInterval = easySwordSpawnInterval;
                boss.mode = "easy";
                break;
        }
    }
    CTX.fillStyle = "white";
    CTX.fillRect(20,20,220,70);
    CTX.fillStyle = "green";
    CTX.fillRect(30,30,200 * player.health/100,50);
    CTX.fillStyle = "black";
    CTX.font = "40px Monospace";
    CTX.textAlign = "center";
    CTX.textBasline = "top";
    CTX.fillText("HP : " + player.health,130,70)
    //CTX.fillText("X : " + flybot.x + "Y : " + flybot.y + "INTERVAL : "+ flybotinterval + "DIFFICULTY" + boss.mode,100,50);

}

function winScreen() 
{
    CTX.textAlign = "left";
    CTX.textBasline = "top";
    CTX.globalAlpha = 1;
    CTX.drawImage(olympus,0,0,WIDTH,HEIGHT);
    CTX.drawImage(clarkImg,150,275,126,145)
    CTX.drawImage(oracle,WIDTH - 150,275,125,145);
    CTX.fillStyle = "white";
    CTX.fillRect(0,400,WIDTH,150);
    CTX.fillStyle = "black";
    CTX.font = "40px Monospace";
    CTX.fillText("ORACLE : ",50,445);
    CTX.font = "20px Arial"
    CTX.fillText("Thanks for saving the 128 Nation from the Evil Wizard of English.",50,475);
    CTX.fillText("Have a cookie now bye",50,520);
}

function animate() 
{
    if (!playingMusic) {
    currentaudio.currentTime = 0;
    currentaudio.pause();
    /*switch (stage) 
    {
        case 0:
            currentaudio = startaudio;
            break;
        case 1: 
            currentaudio = playaudio;
            break;
        case 2: 
            currentaudio = winaudio;
            break;
    } */
    if (stage === 0) 
    {
        currentaudio = startaudio;
    } else if (stage === 1) 
    {
        currentaudio = playaudio;
    } else if (stage === 2) 
    {
        currentaudio = winaudio;
    }
    playingMusic = true;
    currentaudio.currentTime = 0;
    currentaudio.preload = "auto";
    currentaudio.play();
    }
    CTX.clearRect(0,0,WIDTH,HEIGHT);
    if (player.health <= 0) 
    {
        player.health = 100;
        playingMusic = false;
        stage = 0;
    }
    switch(stage) 
    {
        case 0:
            startScreen();
            break;
        case 1:
            fightScreen();
            break;
        case 2:
            winScreen();
            break;
    }
    requestAnimationFrame(animate);
} animate();
});
} catch(error) 
{
    document.body.innerHTML += error;
}
