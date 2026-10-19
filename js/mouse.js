var mouseX = 0
var mouseY = 0
var mouseEventMove
var mouseEventUp
var mouseEventDown
var allowMouseControl = false

function ddMouseMove(evt) {
  if (mobile_mode) {
    return
  }
  evt.preventDefault()
  mouseEventMove = evt
  mouseX = Math.floor(evt.offsetX/resX)
  mouseY = Math.floor(evt.offsetY/resY)
  switch (daveScreen) {
    case SCREEN_TITLE:
      var newSelectedItem = Math.floor((mouseY-176)/8)
      newSelectedItem = Math.max(newSelectedItem,0)
      newSelectedItem = Math.min(newSelectedItem,2)
      if (newSelectedItem != selectedItem) {
        drawText(" ",96,176+(selectedItem*8),false)
        selectedItem = newSelectedItem
        idle = 0
      }
      break
    case SCREEN_CONTROL_PANEL:
      var newSettingsY
      for (newSettingsY = 3; newSettingsY >= 0; newSettingsY--) {
        if (mouseY >= settingsPositions2[newSettingsY]) {
          break
        }
      }
      var newSettingsX = Math.floor((mouseX-104)/48)
      newSettingsX = Math.max(newSettingsX,0)
      newSettingsX = Math.min(newSettingsX,settingsLimits[newSettingsY])
      if (newSettingsX != settingsX || newSettingsY != settingsY) {
        drawText(" ",128+(settingsX*48),settingsPositions[settingsY],false)
        settingsX = newSettingsX
        settingsY = newSettingsY
      }
  }
}

function ddMouseDown(evt) {
  if (mobile_mode) {
    return
  }
  if (inDemo) {
    exitDemo()
  }
  idle = 0
  evt.preventDefault()
  mouseEventDown = evt
  mouseX = Math.floor(evt.offsetX/resX)
  mouseY = Math.floor(evt.offsetY/resY)
  switch (daveScreen) {
    case SCREEN_TITLE:
    case SCREEN_HIGH_SCORES:
    case SCREEN_CONTROL_PANEL:
      Keys[evt.button == 2 ? K_ESC : K_RET] = true
      break
    case SCREEN_WIN:
      Keys[K_SPACE] = true
      break
  }
}

function ddMouseUp(evt) {
  if (mobile_mode) {
    return
  }
  evt.preventDefault()
  mouseEventUp = evt
  mouseX = Math.floor(evt.offsetX/resX)
  mouseY = Math.floor(evt.offsetY/resY)
  switch (daveScreen) {
    case SCREEN_TITLE:
    case SCREEN_HIGH_SCORES:
    case SCREEN_CONTROL_PANEL:
      Keys[evt.button == 2 ? K_ESC : K_RET] = false
      break
    case SCREEN_WIN:
      Keys[K_SPACE] = false
      break
  }
}