const scorePositions=["first","second","third",  "fourth","fifth","sixth","seventh", "eighth","ninth", "last"]
var defaultEntries = ["John", "Dave",  "Delbert","Clyde", "Keen", "Id",   "Softdisk","Trophy","Pistol","Jetpack"]
var scores = [[],[],[]]
var score = 0
var levelScore = 0
var levelTotalScore = 0
var scoreIncrements=[]
var scoreIncrementIndex=0
var readOnly = false

function findScoreIndex(array, score) {
  for (var i = 0; i <= array.length; i++) {
    if (score > array[i]) {
      return i
    }
  }
  return null
}

// If you're wondering why this isn't only the scores despite the name, it's a holdover from earlier versions where it only saved the scores.
function importScores() {
  keyMap[K_CTRL] = parseInt(window.localStorage.getItem("dave-keys-fire"))
  keyMap[K_ALT] = parseInt(window.localStorage.getItem("dave-keys-jetpack"))
  keyMap[K_UP] = parseInt(window.localStorage.getItem("dave-keys-up"))
  keyMap[K_DOWN] = parseInt(window.localStorage.getItem("dave-keys-down"))
  keyMap[K_LEFT] = parseInt(window.localStorage.getItem("dave-keys-left"))
  keyMap[K_RIGHT] = parseInt(window.localStorage.getItem("dave-keys-right"))
  keyMap[K_JUMP] = parseInt(window.localStorage.getItem("dave-keys-jump"))

  switchGraphics(window.localStorage.getItem("dave-style-graphics"))
  settingsAt[0] = parseInt(window.localStorage.getItem("dave-style-number"))
  settingsAt[1] = parseInt(window.localStorage.getItem("dave-screen-factor"))
  settingsAt[2] = parseInt(window.localStorage.getItem("dave-screen-ratio"))

  var w = 320
  var h = 200
  if (settingsAt[2] == 1) {
    h = 240
  }
  w *= (settingsAt[1]+1)
  h *= (settingsAt[1]+1)
  setRes(w,h)

  if (window.localStorage.getItem("dave-gamepad")) {
    var a = window.localStorage.getItem("dave-gamepad").split(",")
    for (var i = 0; i < a.length; i++) {
      controller_map[i] = parseInt(a[i])
    }
  }
  rumble_enabled = (window.localStorage.getItem("dave-gamepad-rumble") == "yes")

  for (var i = 0; i < cheats.length; i++) {
    if (window.localStorage.getItem("dave-cheat-" + i.toString())) {
      rememberedCheats[i] = true
    }
  }

  var oldFormat = !!window.localStorage.getItem("dave-highscores-l0")

  if (!oldFormat) {
    scores[1] = window.localStorage.getItem("dave-highscores-l").split(",")
    scores[0] = window.localStorage.getItem("dave-highscores-s").split(",")
  }

  for (var i = 0; i <= 9; i++) {
    scores[2][i] = window.localStorage.getItem("dave-highscores-n" + i.toString())
    if (oldFormat) {
      scores[1][i] = window.localStorage.getItem("dave-highscores-l" + i.toString())
      scores[0][i] = parseInt(window.localStorage.getItem("dave-highscores-s" + i.toString()))
    } else {
      scores[0][i] = parseInt(scores[0][i])
    }
  }
}

function exportScores() {
  if (readOnly) {
    return
  }
  window.localStorage.setItem("dave-keys-fire",keyMap[K_CTRL])
  window.localStorage.setItem("dave-keys-jetpack",keyMap[K_ALT])
  window.localStorage.setItem("dave-keys-jump",keyMap[K_JUMP])
  window.localStorage.setItem("dave-keys-up",keyMap[K_UP])
  window.localStorage.setItem("dave-keys-down",keyMap[K_DOWN])
  window.localStorage.setItem("dave-keys-left",keyMap[K_LEFT])
  window.localStorage.setItem("dave-keys-right",keyMap[K_RIGHT])
  window.localStorage.setItem("dave-style-number",settingsAt[0])
  window.localStorage.setItem("dave-style-graphics",graphicsSet)
  window.localStorage.setItem("dave-screen-factor",settingsAt[1])
  window.localStorage.setItem("dave-screen-ratio",settingsAt[2])
  window.localStorage.setItem("dave-gamepad",controller_map.join(","))
  window.localStorage.setItem("dave-gamepad-rumble",(rumble_enabled ? "yes" : "no"))
  for (var i = 0; i < cheats.length; i++) {
    if (rememberedCheats[i] != false) {
      window.localStorage.setItem("dave-cheat-" + i.toString(),"yes")
    }
  }
  for (var i = 0; i <= 9; i++) {
    window.localStorage.setItem("dave-highscores-n" + i.toString(), scores[2][i])
    window.localStorage.removeItem("dave-highscores-l" + i.toString())
    window.localStorage.removeItem("dave-highscores-s" + i.toString())
  }
  window.localStorage.setItem("dave-highscores-l",scores[1].join(','))
  window.localStorage.setItem("dave-highscores-s",scores[0].join(','))
}

function resetScores(justTheScores) {
  if (!justTheScores) {
    keyMap[K_CTRL] = 17
    keyMap[K_ALT] = 18
    keyMap[K_UP] = 38
    keyMap[K_DOWN] = 40
    keyMap[K_LEFT] = 37
    keyMap[K_RIGHT] = 39
    keyMap[K_JUMP] = 32
    settingsAt = [2,1,0]
    switchGraphics("vga")
    controller_map = []
    rumble_enabled = true
    if (!readOnly) {
      window.localStorage.setItem("dave-keys-jump",keyMap[K_JUMP])
      window.localStorage.setItem("dave-keys-fire",keyMap[K_CTRL])
      window.localStorage.setItem("dave-keys-jetpack",keyMap[K_ALT])
      window.localStorage.setItem("dave-keys-up",keyMap[K_UP])
      window.localStorage.setItem("dave-keys-down",keyMap[K_DOWN])
      window.localStorage.setItem("dave-keys-left",keyMap[K_LEFT])
      window.localStorage.setItem("dave-keys-right",keyMap[K_RIGHT])
      window.localStorage.setItem("dave-style-number",settingsAt[0])
      window.localStorage.setItem("dave-style-graphics",graphicsSet)
      window.localStorage.setItem("dave-screen-factor",settingsAt[1])
      window.localStorage.setItem("dave-screen-ratio",settingsAt[2])
      window.localStorage.setItem("dave-style-graphics",graphicsSet)
      for (var i = 0; i < cheats.length; i++) {
        if (rememberedCheats[i]) {
          window.localStorage.removeItem("dave-cheat-" + i.toString())
          rememberedCheats[i] = false
        }
      }
      window.localStorage.removeItem("dave-gamepad")
      window.localStorage.removeItem("dave-gamepad-rumble")
    }
  }
  for (var i = 0; i <= 9; i++) {
    scores[2][i] = defaultEntries[i]
    scores[1][i] = Math.ceil((10-i)/5)+1
    scores[0][i] = 3000+((9-i)*50)
    window.localStorage.setItem("dave-highscores-n" + i.toString(), defaultEntries[i])
    //window.localStorage.setItem("dave-highscores-l" + i.toString(), Math.ceil((10-i)/5)+1)
    //window.localStorage.setItem("dave-highscores-s" + i.toString(), 3000+((9-i)*50))
  }
  window.localStorage.setItem("dave-highscores-l",scores[1].join(","))
  window.localStorage.setItem("dave-highscores-s",scores[0].join(","))
}

function copyScores() {
  exportScores()
  var k = Object.keys(localStorage)
  var s = ""
  for (var i = 0; i < k.length; i++) {
    if (k[i].substr(0,5) == "dave-") {
      s += k[i]
      s += "\n"
      s += localStorage[k[i]]
      s += "\n\n"
    }
  }
  navigator.clipboard.writeText(s)
}

function pasteScores(paste) {
  var scoreData = paste.split("\n\n")
  for (var i = 0; i < scoreData.length; i++) {
    if (!scoreData[i]) {
      break
    }
    s = scoreData[i].split("\n")
    window.localStorage.setItem(s[0],s[1])
  }
  importScores()
}

function addScore(amount) {
  score += amount
  levelScore += amount
  scoreIncrements.push(amount)
  if (score >= lifeAt) {
    if (lives<3) {
      lives++
    }
    lifeAt += 20000
  }
  updateHud()
}

var username
var isWin

function hideUserNameModal(scoreIndex) {
  var m = document.getElementById('user-name-modal')
  if (!m) return

  if (username) {
    scores[0].splice(scoreIndex, 0, score)
    scores[1].splice(scoreIndex, 0, isWin ? "won" : currentLevel)
    scores[2].splice(scoreIndex, 0, username)
    scores[0].pop()
    scores[1].pop()
    scores[2].pop()
    exportScores()
  }
  isWin = null
  username = null     
  m.style.display = 'none'
  freezeGame = false
  // resume after purchase: allow future shop offers when player dies again
  //shopShown = false
}

function showUserNameModal(scoreIndex) {
  createUsernameModal(scoreIndex)
  var m = document.getElementById('user-name-modal')
  if (!m) return
  // mark that modal was shown for this death to avoid repetition during the same event
  //shopShown = true
  m.style.display = 'flex'
  freezeGame = true
}

function createUsernameModal(scoreIndex) {
  if (document.getElementById('user-name-modal')) return

  var modal = document.createElement('div')
  modal.id = 'user-name-modal'
  modal.style.position = 'fixed'
  modal.style.left = '0'
  modal.style.top = '0'
  modal.style.width = '100%'
  modal.style.height = '100%'
  modal.style.display = 'none'
  modal.style.alignItems = 'center'
  modal.style.justifyContent = 'center'
  modal.style.backgroundColor = 'rgba(0,0,0,0.6)'
  modal.style.zIndex = 9999

  var panel = document.createElement('div')
  panel.style.background = '#000'
  panel.style.padding = '12px'
  panel.style.borderRadius = '6px'
  panel.style.minWidth = '280px'
  panel.style.maxWidth = '90%'
  panel.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)'
  panel.style.color = '#fff'
  panel.style.fontFamily = 'monospace'
  panel.style.textAlign = 'center'
  panel.style.border = '8px solid transparent'
  panel.style.borderImageSource = 'url(gfx/vga/help-border.png)'
  panel.style.borderImageSlice = '25%'
  panel.style.borderImageRepeat = 'repeat'

  var title = document.createElement('div')
  title.innerText = "CONGRATULATIONS! You got " + scorePositions[scoreIndex] + " place! Enter your name:"
  title.style.fontSize = '18px'
  title.style.marginBottom = '8px'
  panel.appendChild(title)

  var customWrap = document.createElement('div')
  customWrap.style.display = 'flex'
  customWrap.style.gap = '8px'
  customWrap.style.marginBottom = '8px'

  var customInput = document.createElement('input')
  customInput.type = ''
  //customInput.min = '1'
  customInput.value = ''
  customInput.style.flex = '1'
  customInput.id = 'tg-shop-custom-input'
  customInput.style.padding = '6px'
  customInput.style.fontFamily = 'monospace'

  var customBtn = document.createElement('button')
  customBtn.innerText = 'OK'
  styleShopButton(customBtn)
  customBtn.onclick = function() {
    username = customInput.value
    setTimeout(function() {
      hideUserNameModal(scoreIndex)
    //updateHud()
    }, 600)
   }
  
  customWrap.appendChild(customInput)
  customWrap.appendChild(customBtn)
  panel.appendChild(customWrap)

  var footer = document.createElement('div')
  footer.style.display = 'flex'
  footer.style.justifyContent = 'space-between'

  var cancel = document.createElement('button')
  cancel.innerText = 'Cancel'
  styleShopButton(cancel)
  cancel.onclick = function() { hideUserNameModal() }

  footer.appendChild(cancel)
  footer.appendChild(customBtn)
  panel.appendChild(footer)

  modal.appendChild(panel)
  document.body.appendChild(modal)
}

function endGame(win) {
  inWarp = false
  daveScreen = (customLevel ? SCREEN_TITLE : SCREEN_HIGH_SCORES); frame = 0; menuFrame = 0
  if (customLevel || (!music["scores"] && music["gameover"])) {
    setMusic("title")
  } else {
    setMusic("scores")
  }
  loadLevel(0)
  if (!disqualified) {
    var scoreIndex = findScoreIndex(scores[0], score)
    if (scoreIndex != null) {
        isWin = win
        showUserNameModal(scoreIndex)
        window.recordHighScore(score)
    }
  }
}
