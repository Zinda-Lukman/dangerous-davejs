var Keys = new Array()
var KeysReR = new Array()
var gameWillSave = false
const K_UP = 0
const K_DOWN = 1
const K_LEFT = 2
const K_RIGHT = 3
const K_CTRL = 4
const K_ALT = 5
const K_GUN = 4
const K_JETPACK = 5
const K_JUMP = 6
const K_ESC = 7
const K_RET = 8
const K_SPACE = 9
const K_Y = 10
const K_N = 11
const K_UP2 = 12
const K_DOWN2 = 13
const K_LEFT2 = 14
const K_RIGHT2 = 15
const K_GUN2 = 16
const K_JETPACK2 = 17
const keyLabels = ["Up","Down","Left","Right","Gun","Jetpack","Jump","Exit","Confirm","Space","Yes","No","Settings"]
var keyMap = []
keyMap[K_CTRL] = 17
keyMap[K_ALT] = 18
keyMap[K_UP] = 38
keyMap[K_DOWN] = 40
keyMap[K_LEFT] = 37
keyMap[K_RIGHT] = 39
keyMap[K_UP2] = 87
keyMap[K_DOWN2] = 83
keyMap[K_LEFT2] = 65
keyMap[K_RIGHT2] = 68
keyMap[K_JUMP] = 32
Keys[K_CTRL] = false
Keys[K_ALT] = false
Keys[K_ESC] = false
Keys[K_UP] = false
Keys[K_DOWN] = false
Keys[K_LEFT] = false
Keys[K_RIGHT] = false
Keys[K_RET] = false
Keys[K_SPACE] = false
// "ReR" stands for "Release Ready".
KeysReR[K_CTRL] = false
KeysReR[K_ALT] = false
KeysReR[K_ESC] = false
KeysReR[K_UP] = false
KeysReR[K_DOWN] = false
KeysReR[K_LEFT] = false
KeysReR[K_RIGHT] = false
KeysReR[K_RET] = false
KeysReR[K_SPACE] = false

var keyRedefine = -1

const keyStrings = []
keyStrings[8] = "Backspace"
keyStrings[9] = "Tab"
keyStrings[12] = "Feed"
keyStrings[13] = "Enter"
keyStrings[16] = "Shift"
keyStrings[17] = "Control"
keyStrings[18] = "Alt"
keyStrings[19] = "Pause"
keyStrings[20] = "Caps Lock"
keyStrings[27] = "Escape"
keyStrings[32] = "Space"
keyStrings[33] = "Page Up"
keyStrings[34] = "Page Down"
keyStrings[35] = "End"
keyStrings[36] = "Home"
keyStrings[37] = "\x15"
keyStrings[38] = "\x0F"
keyStrings[39] = "\x11"
keyStrings[40] = "\x13"
keyStrings[44] = "Print"
keyStrings[45] = "Insert"
keyStrings[46] = "Delete"
keyStrings[48] = "0"
keyStrings[49] = "1"
keyStrings[50] = "2"
keyStrings[51] = "3"
keyStrings[52] = "4"
keyStrings[53] = "5"
keyStrings[54] = "6"
keyStrings[55] = "7"
keyStrings[56] = "8"
keyStrings[57] = "9"
keyStrings[65] = "A"
keyStrings[66] = "B"
keyStrings[67] = "C"
keyStrings[68] = "D"
keyStrings[69] = "E"
keyStrings[70] = "F"
keyStrings[71] = "G"
keyStrings[72] = "H"
keyStrings[73] = "I"
keyStrings[74] = "J"
keyStrings[75] = "K"
keyStrings[76] = "L"
keyStrings[77] = "M"
keyStrings[78] = "N"
keyStrings[79] = "O"
keyStrings[80] = "P"
keyStrings[81] = "Q"
keyStrings[82] = "R"
keyStrings[83] = "S"
keyStrings[84] = "T"
keyStrings[85] = "U"
keyStrings[86] = "V"
keyStrings[87] = "W"
keyStrings[88] = "X"
keyStrings[89] = "Y"
keyStrings[90] = "Z"
keyStrings[91] = "Meta"
keyStrings[93] = "Menu"
keyStrings[106] = "Multiply"
keyStrings[107] = "Add"
keyStrings[109] = "Subtract"
keyStrings[111] = "Divide"
keyStrings[112] = "F1"
keyStrings[113] = "F2"
keyStrings[114] = "F3"
keyStrings[115] = "F4"
keyStrings[116] = "F5"
keyStrings[117] = "F6"
keyStrings[118] = "F7"
keyStrings[119] = "F8"
keyStrings[120] = "F9"
keyStrings[121] = "F10"
keyStrings[122] = "F11"
keyStrings[123] = "F12"
keyStrings[144] = "Num Lock"
keyStrings[145] = "ScrollLock"
keyStrings[186] = ";"
keyStrings[187] = "="
keyStrings[188] = ","
keyStrings[189] = "-"
keyStrings[190] = "."
keyStrings[191] = "/"
keyStrings[192] = "`"
keyStrings[219] = "["
keyStrings[220] = "\\"
keyStrings[221] = "]"
keyStrings[222] = "'"

function getKeyCode(evt) {
  if (!evt) {
    return 0
  }

  if (typeof evt.which === 'number' && evt.which !== 0) {
    return evt.which
  }
  if (typeof evt.keyCode === 'number' && evt.keyCode !== 0) {
    return evt.keyCode
  }

  var code = typeof evt.code === 'string' ? evt.code : ''
  switch (code) {
    case 'ArrowUp': return 38
    case 'ArrowDown': return 40
    case 'ArrowLeft': return 37
    case 'ArrowRight': return 39
    case 'KeyW': return 87
    case 'KeyA': return 65
    case 'KeyS': return 83
    case 'KeyD': return 68
    case 'Space': return 32
    case 'Enter': return 13
    case 'Escape': return 27
    default: return 0
  }
}

function checkIt(evt) {
  var evt = (evt) ? evt : event
  var charCode = getKeyCode(evt)
  if (daveScreen == SCREEN_GAME || (charCode >= 112 && charCode <= 123)) {
    if (evt && typeof evt.preventDefault === 'function') {
      evt.preventDefault()
    }
  }
  if (freezeGame) {
    if (charCode == 27) {
      hideHelp()
    }
    return true
  }
  mobile_mode = false
  last_input_by_gamepad = false
  if (inDemo) {
    exitDemo()
  } else if (keyRedefine >= 0) {
    for (var i=0;i<7;i++) {
      if (i != keyRedefine && keyMap[i] == charCode) {
        return false
      }
    }
    if (charCode != 27) {
      keyMap[keyRedefine] = charCode
    }
    keyRedefine = -2
    return false
  } else if (daveScreen == SCREEN_KEYBOARD && charCode >= 48 && charCode <= 54) {
    keyRedefine = charCode-48
    menuFrame = 0
    return false
  } else {
    switch (charCode) {
      case keyMap[K_CTRL]:
        Keys[K_CTRL] = true; break
      case keyMap[K_ALT]:
        Keys[K_ALT] = true; break
      case keyMap[K_UP]:
      case keyMap[K_UP2]:
      case keyMap[K_JUMP]:
        Keys[K_UP] = true; break
      case keyMap[K_DOWN]:
      case keyMap[K_DOWN2]:
        Keys[K_DOWN] = true; break
      case keyMap[K_LEFT]:
      case keyMap[K_LEFT2]:
        Keys[K_LEFT] = true; break
      case keyMap[K_RIGHT]:
      case keyMap[K_RIGHT2]:
        Keys[K_RIGHT] = true; break
    }
  }
  switch (charCode) {
    case 27:
    case 121:
      Keys[K_ESC] = true
      return false
    case 32:
      Keys[K_SPACE] = true
      return false
    case 13:
      Keys[K_RET] = true
      return false
    case 89:
      Keys[K_Y] = true
      return false
    case 78:
      Keys[K_N] = true
      return false
  }
  return true
}

function noKey(evt) {
  var evt = (evt) ? evt : event
  var charCode = getKeyCode(evt)
  var gameKey = false
  var konami = false
  last_input_by_gamepad = false
  if (keyRedefine >= 0 || freezeGame) {
    return false
  }
  switch (charCode) {
    case keyMap[K_CTRL]:
      Keys[K_CTRL] = false
      gameKey = true
      break
    case keyMap[K_ALT]:
      Keys[K_ALT] = false
      gameKey = true
      break
    case keyMap[K_UP]:
    case keyMap[K_UP2]:
    case keyMap[K_JUMP]:
        Keys[K_UP] = false
        gameKey = true
        if (cheats[4][cheati[4]] == '&') {
          cheati[4]++
          konami = true
        } else if (cheati[4] == 2) {
          konami = true
        }
        break
    case keyMap[K_DOWN]:
    case keyMap[K_DOWN2]:
      Keys[K_DOWN] = false
      gameKey = true
      if (cheats[4][cheati[4]] == '(') {
        cheati[4]++
        konami = true
      }
      break
    case keyMap[K_LEFT]:
    case keyMap[K_LEFT2]:
      Keys[K_LEFT] = false
      gameKey = true
      if (cheats[4][cheati[4]] == '%') {
        cheati[4]++
        konami = true
      }
      break
    case keyMap[K_RIGHT]:
    case keyMap[K_RIGHT2]:
      Keys[K_RIGHT] = false
      gameKey = true
      if (cheats[4][cheati[4]] == "'") {
        cheati[4]++
        konami = true
      }
      break
  }
  switch (charCode) {
    case 89:
      Keys[K_Y] = false
      break
    case 78:
      Keys[K_N] = false
      break
    case 27:
    case 121:
      Keys[K_ESC] = false
      return false
    case 32:
      Keys[K_SPACE] = false
      return false
    case 13:
      Keys[K_RET] = false
      return false
    case 112:
      freezeGame = true
      help.style.display = 'block'
      canvas.style.display = "none"
      return false
    case 113:
      openSettings()
      return false
    case 116:
      gameWillSave = true
      return false
    case 19:
    case 120:
      if (daveScreen == SCREEN_GAME) {
        drawText("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",64,80,false)
        drawText("\x04                      \x05",64,88,false)
        drawText("\x04 press esc to unpause \x05",64,96,false)
        drawText("\x04                      \x05",64,104,false)
        drawText("\x06\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x08",64,112,false)
        freezeGame = true
        if (soundSystem == SNDSYS_BUFFER) {
          audioCtx.suspend()
        } else if (soundSystem == SNDSYS_ELEMENT && music[currentMusic]) {
          music[currentMusic].pause()
        }
      }
      return false
  }
  if ((charCode >= 37 && charCode <= 40) || (charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90)) {
    for (var i=0;i<cheats.length;i++) {
      if ((konami && i == 4) || (daveScreen != SCREEN_GAME && !globalCheats.includes(i))) {
        continue
      }
      var cheatChar = String.fromCharCode(charCode)
      if (cheats[i][cheati[i]] == cheatChar) {
        cheati[i]++
        if (cheati[i] >= cheats[i].length) {
          activateCheat(i)
          break
        }
      } else if (i == 4 && cheatChar == '&' && cheati[4] == 2) {
        // do nothing
      } else if (cheats[i][0] == cheatChar) {
        cheati[i]=1
      } else {
        cheati[i]=0
      }
    }
  }
  return !gameKey
}

function pressAnyKey() {
  if (!Keys[K_LEFT] && KeysReR[K_LEFT]) {
    KeysReR[K_LEFT] = false
  } else if (!Keys[K_RIGHT] && KeysReR[K_RIGHT]) {
    KeysReR[K_RIGHT] = false
  } else if (!Keys[K_DOWN] && KeysReR[K_DOWN]) {
    KeysReR[K_DOWN] = false
  } else if (!Keys[K_UP] && KeysReR[K_UP]) {
    KeysReR[K_UP] = false
  } else if (!Keys[K_ALT] && KeysReR[K_ALT]) {
    KeysReR[K_ALT] = false
  } else if (!Keys[K_CTRL] && KeysReR[K_CTRL]) {
    KeysReR[K_CTRL] = false
  } else if (!Keys[K_RET] && KeysReR[K_RET]) {
    KeysReR[K_RET] = false
  } else if (!Keys[K_SPACE] && KeysReR[K_SPACE]) {
    KeysReR[K_SPACE] = false
  } else if ((Keys[K_LEFT] && !KeysReR[K_LEFT]) || (Keys[K_RIGHT] && !KeysReR[K_RIGHT]) || (Keys[K_DOWN] && !KeysReR[K_DOWN]) || (Keys[K_UP] && !KeysReR[K_UP]) || (Keys[K_ALT] && !KeysReR[K_ALT]) || (Keys[K_CTRL] && !KeysReR[K_CTRL]) || (Keys[K_RET] && !KeysReR[K_RET]) || (Keys[K_SPACE] && !KeysReR[K_SPACE])) {
    return true
  }
  return false
}

var keyboardHandlersBound = false

function isEditableInputElement(target) {
  if (!target) {
    return false
  }

  try {
    if (typeof target.isContentEditable === 'boolean' && target.isContentEditable) {
      return true
    }
    if (typeof target.contentEditable === 'string' && target.contentEditable.toLowerCase() === 'true') {
      return true
    }
    if (typeof target.tagName === 'string') {
      var tag = target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return true
      }
    }
    if (typeof target.matches === 'function') {
      return target.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]')
    }
  } catch (err) {
    return false
  }

  return false
}

function focusGameInputTarget(evt) {
  try {
    if (typeof document === 'undefined') {
      return false
    }

    var activeTarget = evt && evt.target ? evt.target : document.activeElement
    if (isEditableInputElement(activeTarget)) {
      return false
    }

    var targets = []
    if (document.body) {
      targets.push(document.body)
    }
    if (document.documentElement) {
      targets.push(document.documentElement)
    }
    if (typeof canvas !== 'undefined' && canvas) {
      targets.push(canvas)
    }

    for (var i = 0; i < targets.length; i++) {
      var target = targets[i]
      if (target && typeof target.setAttribute === 'function') {
        target.setAttribute('tabindex', '-1')
      }
    }

    if (typeof canvas !== 'undefined' && canvas && typeof canvas.focus === 'function') {
      canvas.focus()
    }
    if (document.body && typeof document.body.focus === 'function') {
      document.body.focus()
    }
    if (document.documentElement && typeof document.documentElement.focus === 'function') {
      document.documentElement.focus()
    }
    return true
  } catch (err) {
    return false
  }
}

function attachKeyboardHandlers() {
  if (keyboardHandlersBound || typeof window === 'undefined') {
    return false
  }

  keyboardHandlersBound = true

  function bind(target, type, handler) {
    if (!target || typeof target.addEventListener !== 'function') {
      return
    }
    try {
      target.addEventListener(type, handler, { passive: false, capture: true })
    } catch (err) {
      target.addEventListener(type, handler, true)
    }
  }

  var onKeyDown = function(evt) {
    if (evt && evt.defaultPrevented) {
      return
    }
    focusGameInputTarget(evt)
    checkIt(evt)
  }

  var onKeyUp = function(evt) {
    if (evt && evt.defaultPrevented) {
      return
    }
    focusGameInputTarget(evt)
    noKey(evt)
  }

  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    try {
      if (typeof window.Telegram.WebApp.expand === 'function') {
        window.Telegram.WebApp.expand()
      }
    } catch (err) {}
  }

  bind(window, 'keydown', onKeyDown)
  bind(window, 'keyup', onKeyUp)
  bind(window, 'pointerdown', focusGameInputTarget)
  bind(window, 'mousedown', focusGameInputTarget)
  bind(window, 'touchstart', focusGameInputTarget)
  if (typeof window.focus === 'function') {
    try { window.focus() } catch (err) {}
  }

  if (typeof document !== 'undefined') {
    bind(document, 'keydown', onKeyDown)
    bind(document, 'keyup', onKeyUp)
    bind(document, 'pointerdown', focusGameInputTarget)
    bind(document, 'mousedown', focusGameInputTarget)
    bind(document, 'touchstart', focusGameInputTarget)
    if (document.body) {
      if (typeof document.body.setAttribute === 'function') {
        document.body.setAttribute('tabindex', '-1')
      }
      bind(document.body, 'keydown', onKeyDown)
      bind(document.body, 'keyup', onKeyUp)
      bind(document.body, 'pointerdown', focusGameInputTarget)
      bind(document.body, 'mousedown', focusGameInputTarget)
      bind(document.body, 'touchstart', focusGameInputTarget)
    }
    if (typeof canvas !== 'undefined' && canvas) {
      if (typeof canvas.setAttribute === 'function') {
        canvas.setAttribute('tabindex', '-1')
      }
      bind(canvas, 'keydown', onKeyDown)
      bind(canvas, 'keyup', onKeyUp)
      bind(canvas, 'pointerdown', focusGameInputTarget)
      bind(canvas, 'mousedown', focusGameInputTarget)
      bind(canvas, 'touchstart', focusGameInputTarget)
    }
  }

  focusGameInputTarget()
  return true
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('load', attachKeyboardHandlers, { passive: true })
  window.addEventListener('focus', attachKeyboardHandlers, { passive: true })
  window.addEventListener('visibilitychange', function() {
    try {
      focusGameInputTarget()
    } catch (err) {}
  }, { passive: true })
}

attachKeyboardHandlers()