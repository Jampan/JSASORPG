/* TO ADD
GEAR LOOTING
[ ] enemy spawns with sword/shield
    [ ] set spawn rate
    [ ] set upgrade range
[ ] loot enemy sword/shield
    [ ] dismantle or use?

FARIES
[ ] faries recover hp on death
    [ ] set spawn rate
    [ ] cost/effort to aquire

POTIONS
[ ] craft potions in camp
    [ ] set supply cost
[ ] heal in battle
    [ ] set hp% trigger
    [ ] set supply cost
    
BARS
[X] HP BARS 

BLOCK break
[ ] set base chance 
[ ] imcreases if mashing block
    
*/

// CONFIG

const newcharacter = {
    lvl: 1,
    xp: 0,
    hp: 10,
    strength: 1,
    defense: 1,
    sword: 0,
    shield: 0,
    supplies: 0,
    potions: 1
}
var newgame
var player = Object.assign({}, newcharacter)
var enemy
var info
var braveprompt = "Brave"
var guardprompt = "Guard"
var log
var pstatmod = 1
var situation
var estatmod = 2
var ehpmod = .5
var estatrange =.75
var elvlmod = 1
var critchance = .25
var critmod = 2
var ambush = .20
var healmod = 1
var potionmod = 3
var potiontrigger = .3
var smithcost = 25
var smithchance =.25

var leftbutton
var rightbutton
var iconsize = "24px"
var braveicon  = "<img id='braveicon' src='icons/brave.png' height=" + iconsize + " width=" + iconsize + ">"
var guardicon  = "<img src='icons/guard.png' height=" + iconsize + " width=" + iconsize + ">" 
var strengthicon  = "<img src='icons/strength.png' height=" + iconsize + " width=" + iconsize + ">"
var defenseicon  = "<img src='icons/defense.png' height=" + iconsize + " width=" + iconsize + ">" 
var swordicon  = "<img src='icons/sword.png' height=" + iconsize + " width=" + iconsize + ">"
var shieldicon  = "<img src='icons/shield.png' height=" + iconsize + " width=" + iconsize + ">" 
var potionsicon  = "<img src='icons/potion.png' height=" + iconsize + " width=" + iconsize + ">"
var suppliesicon  = "<img src='icons/supplies.png' height=" + iconsize + " width=" + iconsize + ">" 

// CORE FUNCTIONS

function newGame() {
    newgame = true
    player = Object.assign({}, newcharacter)
    action = null
    info = "You will learn when to be brave." + "<br>" + "Proceed with" +"<br>" + braveicon + " " + guardicon
    braveprompt = "Brave"
    guardprompt = "Guard"
    log = "Your first steps "
    situation = "camp"
}
function newEnemy() {
    enemy = Object.assign({}, newcharacter)
    enemy.lvl = player.lvl * elvlmod
    enemy.lvl = Math.round(enemy.lvl)
    enemy.hp = enemy.lvl * 10 * ehpmod
    let basestat = enemy.lvl * estatmod / 2
    let statdiff = Math.random() * estatrange
    let buffedstat = basestat + (statdiff * basestat)
    if (Math.random() < .5) {
        enemy.strength = Math.round(buffedstat)
        enemy.defense = 2 * basestat - enemy.strength
    } else {
        enemy.defense = Math.round(buffedstat)
        enemy.strength = 2 * basestat - enemy.defense
    }
    while (enemy.strength <= 0) {
        enemy.strength++
        enemy.defense--
    }
    enemy.supplies = enemy.lvl*2
    enemy.xp = enemy.lvl
    return enemy
}
function levelup(stat) {
    if (player.xp >= player.lvl ** 2) {
        player.xp -= player.lvl ** 2
        player.lvl++
        player[stat]++
        log = "Your " + stat + " is now " + player[stat]
        player.hp = player.lvl * 10
        player.potions++
    }
}
function smith(stat) {
    let upgrades = player.sword + player.shield
    let cost = smithcost * (2 ** upgrades)
    player[stat]++
    player.supplies -= cost
    log = "Your " + stat + " is now " + player[stat]
    situation = "camp"
}
function crithit() {
    let r = Math.random()
    if (r > (1 - critchance)) {
        return critmod
    }
    return 1
}
function heal() {
    let r = Math.random()
    if (r > (1 - ambush)) {
        situation = "battle"
        enemy = newEnemy()
        log = "Ambush!"
        return
    }
    let hpgain = player.lvl * healmod * crithit()
    if (player.hp < (player.lvl * 10)) {
        if (player.supplies >= player.lvl) {
            player.supplies -= player.lvl
            log = "Healed " + hpgain + " using " + player.lvl + " supplies"
            player.hp += hpgain
        } else {
            log = "You're low on supplies"
        }
    } else {
        log = "You are full health"
    }
    if (player.hp > (player.lvl * 10)) {
        player.hp = player.lvl * 10
    }
}
function potion() {
    if (player.potions > 0) {
        let hpgain = player.lvl * healmod * potionmod * crithit()
        player.hp += hpgain
        log = "Healed " + hpgain + " with a potion"
        player.potions -= 1
    }
}
function dead() {
    if (player.hp <= 0) {
        return true
    }
    return false
}
function win() {
    situation = "camp"
    log = "You loot " + enemy.supplies + " supplies"
    player.xp += enemy.xp
    player.supplies += enemy.supplies
}
function battle() {
    if (player.hp <= (player.lvl * 10 * potiontrigger) && player.potions > 0) {
        potion()
        return
    }
    let negate = (player.defense + player.shield) * crithit()
    let power = (player.strength + player.sword) * crithit()
    if (action == "guard") {
        negate *= 1 + (player.hp / (player.lvl * 10))
        negate = Math.round(negate)
    } else {
        power *= 1 + ((player.hp / (player.lvl * 10)) * pstatmod)
        power = Math.round(power)
    }
    let dmg = (enemy.strength * crithit()) - negate
    if (dmg > 0) {
        player.hp -= dmg
        log = "You lost " + dmg + " health"
    } else {
        log = "Attack blocked"
    }
    enemy.hp -= power
    if (enemy.hp <= 0) {
        win()
        return
    }
}
function brave() {
    action = "brave"
    if (situation == "levelup") {
        levelup("strength")
    } else if (situation == "camp") {
        enemy = newEnemy()
        situation = "battle"
        log = "An enemy!"
        log = "An enemy!"
    } else if (situation == "battle") {
        battle()
    } else if (situation == "smith") {
        smith("sword")
    }
    gameloop()
}
function guard() {
    action = "guard"
    if (situation == "levelup") {
        levelup("defense")
    } else if (situation == "camp") {
        heal()
    } else if (situation == "battle") {
        battle()
    } else if (situation == "smith") {
        smith("shield")
    }
    gameloop()
}

// HTML TABLE AND GAME LOOP

function setbuttons() {
    let leftimg = "brave"
    let rightimg = "guard"
    if (situation == "levelup") {
        let leftimg = "strength"
        let rightimg = "defense"
    } else if (situation == "smith") {
        let leftimg = "sword"
        let rightimg = "shield"
    } else if (situation == "camp") {
        let leftimg = "brave"
        let rightimg = "guard"
    }
    let left = document.getElementById("leftimg")
    let right = document.getElementById("rightimg")
    
    left.src = 'icons/' + leftimg + '.png'
    right.src = 'icons/' + rightimg + '.png'
    //leftbutton = "<img src=icons/" + leftimg + ".png height=" + buttonsize + " width=" + buttonsize + ">"
    //rightbutton = "<img src=icons/" + rightimg + ".png height=" + buttonsize + " width=" + buttonsize + ">"
    //document.getElementById("leftbutton").innerHTML = leftbutton
    //document.getElementById("leftbutton").innerHTML = leftbutton
    
}

function updatetable() {
    let ehpdisplay = "&nbsp"
    if (situation == "battle") {
        ehpdisplay = "<progress id='ehpbar' value=" + enemy.hp + " max=" + (enemy.lvl * 5 * ehpmod) + " ></progress>"
    }
    document.getElementById("hp").innerHTML = "<progress id='hpbar' value=" + player.hp + " max=" + (player.lvl * 10) + " ></progress>"
    document.getElementById("xp").innerHTML = "<progress id='xpbar' value=" + player.xp + " max=" + (player.lvl ** 2) + " ></progress>"
    document.getElementById("enemyhp").innerHTML = ehpdisplay
    setbuttons()
    document.getElementById("lvl").innerHTML = "Level: " + player.lvl
    //document.getElementById("xp").innerHTML = "XP: " + player.xp + " / " +  player.lvl * 5
    document.getElementById("hplabel").innerHTML = "HP: " + player.hp + " / " + (player.lvl * 10)
    document.getElementById("supplies").innerHTML = suppliesicon + " " + player.supplies
    document.getElementById("potions").innerHTML = potionsicon + " " + player.potions
    document.getElementById("strength").innerHTML = strengthicon + " " + player.strength
    document.getElementById("defense").innerHTML = defenseicon + " " + player.defense
    document.getElementById("sword").innerHTML = swordicon + " " + player.sword
    document.getElementById("shield").innerHTML = shieldicon + " " + player.shield
    document.getElementById("info").innerHTML = info
    document.getElementById("log").innerHTML = log
    document.getElementById("braveprompt").innerHTML = braveprompt
    document.getElementById("guardprompt").innerHTML = guardprompt
}

function gameloop() {
    if (dead()) {
        newGame()
    }
    if (situation != "battle") {
        if (player.xp >= player.lvl ** 2) {
            situation = "levelup"
            info = "Level up!" + "<br>" + "Choose a stat" + "<br>" + strengthicon + " " + defenseicon
            braveprompt = "Strength"
            guardprompt = "Defense"
            
        } else {
            situation = "camp"
            if (newgame == false) {
                info = "You can camp here and" + "<br>" + "heal using supplies" + "<br>" + suppliesicon
                braveprompt = "Onwards"
                guardprompt = "Rest up"
                
            } else {
                newgame = false
            }
            if ((Math.random() <= smithchance) && (player.supplies >= (smithcost * (2 ** (player.sword + player.shield))))) {
                console.log('smith')
                situation = "smith"
                info = "A smith visits your camp" + "<br>" + "they will improve your" + "<br>" + swordicon + " sword or shield " + shieldicon
                braveprompt = "Sword"
                guardprompt = "Shield"
                
                log = "This costs " + (smithcost * (2 ** (player.sword + player.shield))) + " supplies"
            }
        }
    } else {
        info = "Enemy" + "<br>" + "<br>" + braveicon + " " + enemy.strength + " | " + enemy.defense + " " + guardicon
        braveprompt = "Attack"
        guardprompt = "Block"
    }
    action = null
    updatetable()
}

// alt input

window.addEventListener("keydown", onKeyDown, true);

function onKeyDown(e){
    // a  / s / left for brave
    if(e.keyCode == 65 || e.keyCode == 37 || e.keyCode == 83) {
        brave()
    }
    // d / right for guard
    if(e.keyCode == 68 || e.keyCode == 39) {
        guard()
    }
}

// Start Game

newGame()
updatetable()

// dev