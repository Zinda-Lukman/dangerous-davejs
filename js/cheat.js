const cheats=[]
const cheatMessages=[]
cheats[0] =        "JOHNROMERO"
cheatMessages[0] = "god mode"
cheats[1] =        "APPLE2"
cheatMessages[1] = "all items"
cheats[2] =        "IDSOFTWARE"
cheatMessages[2] = "level skip"
cheats[3] =        "SOFTDISK"
cheatMessages[3] = "level warp"
cheats[4] =        "&&((%'%'BA"
cheats[7] =        "UUDDLRLRBA"
cheatMessages[4] = "console port"
cheatMessages[7] = cheatMessages[4]
cheats[5] =        "ANGRYFAN"
cheatMessages[5] = "you are die"
cheats[6] =        "SHAVE"
cheatMessages[6] = "oh hi shave"
cheats[8] =        "RECORDDEMO"
cheatMessages[8] = ""
cheats[9] =        "IDKFA"
cheats[10]=        "IDDQD"
cheatMessages[9] = "doom mode"
cheatMessages[10]= cheatMessages[9]
cheats[11]=        "CHARLESJACOBI"
cheatMessages[11]= "chex mode"
cheats[12]=        "SOUNDBLASTER"
cheatMessages[12]= "music pack"

var cheati=Array(cheats.length).fill(0)
var rememberedCheats=Array(cheats.length).fill(false)
var disqualified = false
const disqualifyExceptions = [4,7,9,10,11,12]
const globalCheats = [3,4,8,9,10,11,12]
var invincible = false

function activateCheat(i) {
  // Not all the cheats disqualify, since some are purely cosmetic.
  if (!disqualifyExceptions.includes(i)) {
    explodeSnd.play()
    disqualified = true
  }
  switch (i) {
    case 0: // JOHNROMERO
      invincible = !invincible
      break
    case 1: // APPLE2
      gun = true
      trophy = true
      jetpack = 60
      lives = 3
      break
    case 2: // IDSOFTWARE
      exitLevel()
      break
    case 3: // SOFTDISK
      if (!customLevel && (daveScreen == SCREEN_TITLE || daveScreen == SCREEN_GAME)) {
        if (daveScreen == SCREEN_TITLE || inDemo) {
          if (inDemo) {
            exitDemo(false)
          }
          daveScreen = SCREEN_GAME
          lives = 3
          score = 0
          lifeAt = 20000
          updateHud()
        }
        var l = parseInt(prompt("Which level to warp to?"))
        destL = Math.abs(l)
        if (l <= -1 && l >= -10 && levelWarp[destL] != 0) {
          currentLevel=destL
          inWarp = true
          loadLevel(levelWarp[destL],false)
          if (music["warp"]) {
            setMusic("warp")
          } else {
            setMusic("level"+levelWarp[destL])
          }
        } else if (destL >= 0 && destL <= 10) {
          currentLevel=destL
          inWarp = false
          usedWarp = false
          loadLevel(destL)
          if (destL == 0) {
            setMusic("title")
          } else {
            setMusic("level"+destL)
          }
        }
      }
      break
    case 4: // Up Up Down Down Left Right Left Right B A
    case 7: // UUDDLRLRBA
      if (doomMode || chexMode) {
        chexMode = false
        doomMode = false
        defineLevelMusic("")
      }
      switchGraphics("nes")
      playExplosion = true
      break
    case 5: // ANGRYFAN
      invincible = false
      killDave(true)
      break
    case 6: // SHAVE
      gun = false
      trophy = false
      jetpack = 0
      score = 0
      if (lives>0) {
        lives--
      }
      break
    case 8: // RECORDDEMO
      var l = parseInt(prompt("Which level to record a demo on?"))
      if (l >= 1 && l <= 10) {
        recordDemo(l)
      }
      break
    case 9: // IDKFA
    case 10: // IDDQD
      chexMode = false
      playExplosion = true
      if (graphicsSet != "vga") {
        switchGraphics("vga")
      }
      if (doomMode) {
        doomMode = false
      } else {
        doomMode = true
      }
      updateMusic(true)
      break
    case 11: // CHARLESJACOBI
      doomMode = false
      playExplosion = true
      if (graphicsSet != "vga") {
        switchGraphics("vga")
      }
      if (chexMode) {
        chexMode = false
      } else {
        chexMode = true
      }
      updateMusic(true)
      break
    case 12: // SOUNDBLASTER
      explodeSnd.play()
      doomMode = false
      chexMode = false
      var loader = document.createElement("input")
      loader.setAttribute('type','file')
      loader.click()
      freezeGame = true
      loader.addEventListener('change', (event) => {
        freezeGame = false
        if (event.target.files[0].name.substr(-4) == ".zip") {
          loadMusicFromZip(event.target.files[0])
        } else if (event.target.files[0].name.substr(-4) == ".txt") {
          var reader = new FileReader()
          reader.readAsBinaryString(event.target.files[0])
          reader.addEventListener('load', (event) => {
            var musicFile = event.target.result
            if (musicFile.substr(0,7).toLowerCase() == "$music\n") {
              defineLevelMusic(musicFile.substr(7))
              updateMusic(true)
            }
          })
        }
      })
      break
  }
  updateHud()
  mesg = cheatMessages[i]
  if (i==0) {
    mesg = mesg + " o" + (invincible ? "n" : "ff")
  } else if (i==9 || i==10) {
    mesg = mesg + " o" + (doomMode ? "n" : "ff")
  } else if (i==11) {
    mesg = mesg + " o" + (chexMode ? "n" : "ff")
  }
  drawTextOnHud(mesg,0,192,true)
  //cheati[i]=0
  cheati=Array(cheats.length).fill(0)
  pause = false
}

function cheatButton(letter) {
  var doingCheat = false
  for (var i=0;i<cheats.length;i++) {
    if (cheats[i][cheati[i]] == letter) {
      cheati[i]++
      if (cheati[i] >= cheats[i].length) {
        activateCheat(i)
        doingCheat = false
        rememberedCheats[i] = true
        exportScores()
      } else {
        doingCheat = true
      }
    } else {
      cheati[i]=0
    }
  }
  if (!doingCheat) {
    canvas.style.display = "block"
    document.getElementById("cheatButtons").innerHTML = ""
    cheatDialog = false
  }
}

function cheatButton2(i) {
  activateCheat(i)
  canvas.style.display = "block"
  document.getElementById("cheatButtons").innerHTML = ""
  cheatDialog = false
}
