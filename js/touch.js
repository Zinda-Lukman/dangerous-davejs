var cheatDialog = false
var swipeStart = null
var swipeMoved = false
var swipeHoldDir = null
var lastTapTime = 0
var lastUpSwipeTime = 0

function clearMovementKeys() {
  Keys[K_UP] = false
  Keys[K_DOWN] = false
  Keys[K_LEFT] = false
  Keys[K_RIGHT] = false
}

function triggerKeyPulse(key, ms) {
  Keys[key] = true
  window.setTimeout(function() {
    if (Keys[key]) {
      Keys[key] = false
    }
  }, ms)
}

function handleSwipeGesture(touch) {
  if (!swipeStart || !touch) {
    return null
  }
  var dx = touch.clientX - swipeStart.x
  var dy = touch.clientY - swipeStart.y
  var absX = Math.abs(dx)
  var absY = Math.abs(dy)
  if (Math.max(absX, absY) < 24) {
    return null
  }
  swipeMoved = true
  clearMovementKeys()
  if (absX > absY) {
    if (dx < 0) {
      return 'left'
    }
    return 'right'
  }
  if (dy < 0) {
    return 'up'
  }
  return 'down'
}

function showCheatDialog() {
  //var cheatRequest = prompt("Enter cheat code:").toUpperCase()
  //var foundCheat = -1
  //for (var i = 0;i<cheats.length;i++) {
  //  if (cheatRequest == cheats[i]) {
  //    foundCheat = i
  //  }
  //}
  //if (foundCheat >= 0) {
  //  activateCheat(foundCheat)
  //}
  canvas.style.display = "none"
  for (var i=48;i<=90;i++) {
    if (i>57 && i<65) {
      continue
    }
    document.getElementById("cheatButtons").innerHTML += "<button style='padding: 32px; color: white; background-color: black;' onClick=\"cheatButton('"+String.fromCharCode(i)+"')\">"+String.fromCharCode(i)+"</button>"
  }
  document.getElementById("cheatButtons").innerHTML += "<br/>"
  for (var i=0;i<cheats.length;i++) {
    if (rememberedCheats[i]) {
      document.getElementById("cheatButtons").innerHTML += "<button style='padding: 32px; color: white; background-color: black;' onClick=\"cheatButton2("+i+")\">"+cheats[i]+"</button>"
    }
  }
  cheatDialog = true
  pause = false
  Keys[K_ESC] = false
}

function handleTouches(a,nv,mv) {
  var touchLeft = 0
  var touchRight = 0
  var backButton = false
  var downButton = false
	for (var i=0;i<a.length;i++) {
    var t = a[i]
    var tx = (t.clientX-canvas.getBoundingClientRect().left)/resX
    var ty = (t.clientY-canvas.getBoundingClientRect().top)/resY
    if (tx < 0 && t.force > 0) {
      touchLeft++
      continue
    } else if (tx >= 320 && t.force > 0) {
      touchRight++
      continue
    } else if (ty < 0 || ty >= 200) {
      continue
    }
    if (daveScreen == SCREEN_HIGH_SCORES && !mv) {
      Keys[K_RET] = nv
    } else if (daveScreen == SCREEN_WIN && !mv) {
      Keys[K_SPACE] = nv
    } else if (ty < 30) {
      if (tx >= 290) {
        if (!Keys[K_DOWN]) {
          Keys[K_ESC] = nv
        }
        backButton = true
      } else if (ty < 30 && daveScreen==SCREEN_GAME) {
        openSettings()
        return
      }
    } else if (tx >= 220 && ty >= 100) {
      last_input_by_gamepad = false
      if (daveScreen==SCREEN_GAME) {
        if (ty < 150) {
          if (tx >= 270) {
            Keys[K_CTRL] = nv
          } else {
            Keys[K_ALT] = nv
          }
        } else {
          Keys[K_UP] = nv
        }
      } else {
        Keys[K_RET] = nv
      }
    } else {
      if (tx < 100) {
        if (ty >= 100 && ty < 140) {
          idle = 0
          Keys[K_UP] = nv
          last_input_by_gamepad = false
        } else if (ty >= 160) {
          idle = 0
          Keys[K_DOWN] = nv
          downButton = true
          last_input_by_gamepad = false
        }
      }
      if (ty >= 100) {
        if (tx >= 60 && tx < 100) {
          idle = 0
          Keys[K_RIGHT] = nv
          last_input_by_gamepad = false
        } else if (tx < 40) {
          idle = 0
          Keys[K_LEFT] = nv
          last_input_by_gamepad = false
        }
      }
    }
  }
  if (((touchLeft==2 && touchRight==2 && !mv) || (backButton && downButton)) && daveScreen==SCREEN_GAME && nv) {
    showCheatDialog()
    return true
  } else {
    return false
  }
}

function getTouchList(evt) {
  if (!evt) {
    return []
  }
  if (evt.touches && evt.touches.length) {
    return Array.prototype.slice.call(evt.touches)
  }
  if (evt.changedTouches && evt.changedTouches.length) {
    return Array.prototype.slice.call(evt.changedTouches)
  }
  if (typeof evt.clientX === 'number' || typeof evt.clientY === 'number') {
    return [evt]
  }
  return []
}

function touchMove(evt) {
  if (cheatDialog || freezeGame) {
    return false
  }
  evt.preventDefault()
  var Mevent = (evt) ? evt : event
  var touches = getTouchList(Mevent)
  if (daveScreen == SCREEN_GAME && touchInputMode === 'swipe') {
    Keys[K_CTRL] = false
    Keys[K_ALT] = false
    Keys[K_ESC] = false
    Keys[K_UP] = false
    Keys[K_DOWN] = false
    Keys[K_LEFT] = false
    Keys[K_RIGHT] = false
    Keys[K_RET] = false
    Keys[K_SPACE] = false
    if (touches.length > 0) {
      var primaryTouch = touches[0]
      var gesture = handleSwipeGesture(primaryTouch)
      if (gesture) {
        // hold the direction while the touch remains
        if (swipeHoldDir !== gesture) {
          swipeHoldDir = gesture
          clearMovementKeys()
          if (gesture === 'left') Keys[K_LEFT] = true
          else if (gesture === 'right') Keys[K_RIGHT] = true
          else if (gesture === 'up') Keys[K_UP] = true
          else if (gesture === 'down') Keys[K_DOWN] = true
        }
        return true
      } else if (swipeHoldDir) {
        // continue holding previous swipe direction
        if (swipeHoldDir === 'left') Keys[K_LEFT] = true
        else if (swipeHoldDir === 'right') Keys[K_RIGHT] = true
        else if (swipeHoldDir === 'up') Keys[K_UP] = true
        else if (swipeHoldDir === 'down') Keys[K_DOWN] = true
        return true
      }
    }
    return true
  }
  Keys[K_CTRL] = false
  Keys[K_ALT] = false
  Keys[K_ESC] = false
  Keys[K_UP] = false
  Keys[K_DOWN] = false
  Keys[K_LEFT] = false
  Keys[K_RIGHT] = false
  Keys[K_RET] = false
  Keys[K_SPACE] = false
  handleTouches(touches,true,true)
  return true
}

function ddtouchUp(evt) {
  if (cheatDialog || freezeGame) {
    return false
  }
  evt.preventDefault()
  var Mevent = (evt) ? evt : event
  var touches = getTouchList(Mevent)
  if (daveScreen == SCREEN_GAME && touchInputMode === 'swipe') {
    if (swipeStart) {
      var release = touches[0] || (Mevent && Mevent.changedTouches && Mevent.changedTouches[0])
      if (release) {
        var dx = release.clientX - swipeStart.x
        var dy = release.clientY - swipeStart.y
        var absX = Math.abs(dx)
        var absY = Math.abs(dy)
        var now = Date.now()
        var tapWindow = now - swipeStart.time < 320
        if (swipeMoved && Math.max(absX, absY) >= 24) {
          var swipeDir = null
          if (absX > absY) {
            swipeDir = dx < 0 ? 'left' : 'right'
          } else if (dy < 0) {
            swipeDir = 'up'
          } else {
            swipeDir = 'down'
          }
          if (swipeDir === 'left') {
            triggerKeyPulse(K_LEFT, 90)
          } else if (swipeDir === 'right') {
            triggerKeyPulse(K_RIGHT, 90)
          } else if (swipeDir === 'up') {
            triggerKeyPulse(K_UP, 90)
            if (now - lastUpSwipeTime < 450) {
              triggerKeyPulse(K_JETPACK, 180)
            }
            lastUpSwipeTime = now
          } else if (swipeDir === 'down') {
            triggerKeyPulse(K_DOWN, 90)
          }
        } else if (!swipeMoved && absX < 24 && absY < 24 && tapWindow) {
          if (now - lastTapTime < 360) {
            triggerKeyPulse(K_GUN, 120)
          }
          lastTapTime = now
        }
      }
    }
    // clear any held swipe direction on release
    swipeStart = null
    swipeMoved = false
    swipeHoldDir = null
    return true
  }
  handleTouches(touches,false,false)

  if (daveScreen == SCREEN_GAME && swipeStart) {
    var release = touches[0] || (Mevent && Mevent.changedTouches && Mevent.changedTouches[0])
    if (release) {
      var dx = release.clientX - swipeStart.x
      var dy = release.clientY - swipeStart.y
      var absX = Math.abs(dx)
      var absY = Math.abs(dy)
      var now = Date.now()
      var tapWindow = now - swipeStart.time < 320
      if (swipeMoved && Math.max(absX, absY) >= 24) {
        var swipeDir = null
        if (absX > absY) {
          swipeDir = dx < 0 ? 'left' : 'right'
        } else if (dy < 0) {
          swipeDir = 'up'
        } else {
          swipeDir = 'down'
        }
        if (swipeDir === 'left') {
          triggerKeyPulse(K_LEFT, 90)
        } else if (swipeDir === 'right') {
          triggerKeyPulse(K_RIGHT, 90)
        } else if (swipeDir === 'up') {
          triggerKeyPulse(K_UP, 90)
          if (now - lastUpSwipeTime < 450) {
            triggerKeyPulse(K_JETPACK, 180)
          }
          lastUpSwipeTime = now
        } else if (swipeDir === 'down') {
          triggerKeyPulse(K_DOWN, 90)
        }
      } else if (!swipeMoved && absX < 24 && absY < 24 && tapWindow) {
        if (now - lastTapTime < 360) {
          triggerKeyPulse(K_GUN, 120)
        }
        lastTapTime = now
      }
    }
  }

  // Also support menu navigation gestures on the title screen when using swipe touch mode
  if (daveScreen == SCREEN_TITLE && touchInputMode === 'swipe' && swipeStart) {
    var release = touches[0] || (Mevent && Mevent.changedTouches && Mevent.changedTouches[0])
    if (release) {
      var dx = release.clientX - swipeStart.x
      var dy = release.clientY - swipeStart.y
      var absX = Math.abs(dx)
      var absY = Math.abs(dy)
      var now = Date.now()
      var tapWindow = now - swipeStart.time < 320
      if (swipeMoved && Math.max(absX, absY) >= 24) {
        var swipeDir = null
        if (absX > absY) {
          swipeDir = dx < 0 ? 'left' : 'right'
        } else if (dy < 0) {
          swipeDir = 'up'
        } else {
          swipeDir = 'down'
        }
        if (swipeDir === 'up') {
          triggerKeyPulse(K_UP, 90)
        } else if (swipeDir === 'down') {
          triggerKeyPulse(K_DOWN, 90)
        }
      } else if (!swipeMoved && absX < 24 && absY < 24 && tapWindow) {
        // Double-tap to select on title menu
        if (now - lastTapTime < 360) {
          triggerKeyPulse(K_RET, 120)
        }
        lastTapTime = now
      }
    }
  }

  swipeStart = null
  swipeMoved = false
  return true
}

function ddtouchDown(evt) {
  if (cheatDialog || freezeGame) {
    return false
  }
  if (evt && typeof evt.preventDefault === 'function') {
    evt.preventDefault()
  }
  var Mevent = (evt) ? evt : event
  var touches = getTouchList(Mevent)
  if (!mobile_mode) {
    mobile_mode = true
    switchSounds(soundSet)
  }
  swipeStart = null
  swipeMoved = false
  if (daveScreen == SCREEN_GAME && touchInputMode === 'swipe') {
    if (touches.length > 0) {
      var touch = touches[0]
      swipeStart = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    }
    Keys[K_CTRL] = false
    Keys[K_ALT] = false
    Keys[K_ESC] = false
    Keys[K_UP] = false
    Keys[K_DOWN] = false
    Keys[K_LEFT] = false
    Keys[K_RIGHT] = false
    Keys[K_RET] = false
    Keys[K_SPACE] = false
    // reset hold dir when touching anew
    swipeHoldDir = null
    return true
  }
  if (touches.length > 0) {
    var touch = touches[0]
    swipeStart = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }
  Keys[K_CTRL] = false
  Keys[K_ALT] = false
  Keys[K_ESC] = false
  Keys[K_UP] = false
  Keys[K_DOWN] = false
  Keys[K_LEFT] = false
  Keys[K_RIGHT] = false
  Keys[K_RET] = false
  Keys[K_SPACE] = false
  if (inDemo) {
    exitDemo()
  } else {
    handleTouches(touches,true,false)
  }
  return true
}

var touchHandlersBound = false

function attachTouchHandlers() {
  if (touchHandlersBound || typeof window === 'undefined') {
    return false
  }

  touchHandlersBound = true

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

  bind(window, 'touchstart', ddtouchDown)
  bind(window, 'touchmove', touchMove)
  bind(window, 'touchend', ddtouchUp)
  bind(window, 'touchcancel', ddtouchUp)
  bind(window, 'pointerdown', ddtouchDown)
  bind(window, 'pointermove', touchMove)
  bind(window, 'pointerup', ddtouchUp)
  bind(window, 'pointercancel', ddtouchUp)

  if (typeof document !== 'undefined') {
    bind(document, 'touchstart', ddtouchDown)
    bind(document, 'touchmove', touchMove)
    bind(document, 'touchend', ddtouchUp)
    bind(document, 'touchcancel', ddtouchUp)
    bind(document, 'pointerdown', ddtouchDown)
    bind(document, 'pointermove', touchMove)
    bind(document, 'pointerup', ddtouchUp)
    bind(document, 'pointercancel', ddtouchUp)

    if (document.body) {
      bind(document.body, 'touchstart', ddtouchDown)
      bind(document.body, 'touchmove', touchMove)
      bind(document.body, 'touchend', ddtouchUp)
      bind(document.body, 'touchcancel', ddtouchUp)
      bind(document.body, 'pointerdown', ddtouchDown)
      bind(document.body, 'pointermove', touchMove)
      bind(document.body, 'pointerup', ddtouchUp)
      bind(document.body, 'pointercancel', ddtouchUp)
    }
  }

  return true
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('load', attachTouchHandlers, { passive: true })
  window.addEventListener('focus', attachTouchHandlers, { passive: true })
}

attachTouchHandlers()
