var found_gamepad = false
var gamepad_count = 0
var used_gamepad
var controller_map = []
var gamepad_has_axis = false
var last_gamepad_states = [false,false,false,false,false,false,false,false,false,false,false,false,false]
var last_gamepad_axes = [0,0]
var gamepad_new_button = -1
var gamepad_has_rumble = false
var rumble_enabled = true
var gamepad_fully_mapped = false
var gamepad_settings_mapped = false
var gamepad_a = 0
var gamepad_b = 1
var last_input_by_gamepad = false

function setup_new_gamepad() {
  if (controller_map.length == 0) {
    if (used_gamepad.mapping == "standard") {
      controller_map = [12,13,14,15,2,1,0,8,9,3,5,4,16]
      gamepad_fully_mapped = true
      gamepad_settings_mapped = true
    } else {
      controller_map = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
      gamepad_fully_mapped = false
      gamepad_settings_mapped = false
    }
  } else {
    gamepad_fully_mapped = !controller_map.includes(-1)
    if (new Set(controller_map).size !== controller_map.length) {
      gamepad_fully_mapped = false
    }
    gamepad_settings_mapped = (controller_map.length > 12 && controller_map[12] >= 0)
  }
  gamepad_has_axis = (used_gamepad.axes.length >= 2)
  gamepad_has_rumble = (used_gamepad.vibrationActuator || used_gamepad.hapticActuators)
  if (daveScreen == SCREEN_CONTROL_PANEL || (mobile_mode && daveScreen != SCREEN_HIGH_SCORES)) {
    menuFrame = 0
  }
}

function no_gamepads() {
  found_gamepad = false
  used_gamepad = undefined
  gamepad_fully_mapped = false
  gamepad_settings_mapped = false
  if (daveScreen == SCREEN_CONTROL_PANEL || (mobile_mode && daveScreen != SCREEN_HIGH_SCORES)) {
    menuFrame = 0
  }
}

window.addEventListener("gamepadconnected", function(e) {
  gamepad_count++
  if (e.gamepad.buttons.length == 0) {
    // Ignore any controller that doesn't have buttons.
    return
  }
  found_gamepad = true
  if (!used_gamepad) {
    used_gamepad = e.gamepad
    setup_new_gamepad()
  }
})

window.addEventListener("gamepaddisconnected", function(e) {
  gamepad_count--
  if (gamepad_count == 0) {
    no_gamepads()
  } else if (e.gamepad.index == used_gamepad.index) {
    var pads = navigator.getGamepads()
    var found = false
    for (var i = 0; i < pads.length; i++) {
      if (pads[i]) {
        used_gamepad = pads[i]
        setup_new_gamepad()
        found = true
        break
      }
    }
    if (!found) {
      no_gamepads()
    }
  }
})

// Chrome and Firefox have different APIs for controller vibration, this function makes it easier to account for both.
function vibrateController(len,mag) {
  if (found_gamepad && rumble_enabled && last_input_by_gamepad && !inDemo) {
    if (used_gamepad.vibrationActuator) {
      if (used_gamepad.vibrationActuator.playEffect) {
        used_gamepad.vibrationActuator.playEffect("dual-rumble", {
          startDelay: 0,
          duration: len,
          weakMagnitude: mag,
          strongMagnitude: mag
        })
      }
    } else if (used_gamepad.hapticActuators) {
      for (var i = 0; i < used_gamepad.hapticActuators.length; i++) {
        if (used_gamepad.hapticActuators[i].pulse) {
          used_gamepad.hapticActuators[i].pulse(mag,len)
        } else {
          break
        }
      }
    }
  }
}

function doControllerStuff() {
  if (found_gamepad && daveScreen != SCREEN_JOYSTICK) {
      var gamepad_state = navigator.getGamepads()[used_gamepad.index]
      for (var i=0; i<controller_map.length; i++) {
        if (controller_map[i] < 0) {
          continue
        }
        var j = (i == 6 ? 0 : i)
        if (gamepad_state.buttons[controller_map[i]].pressed != last_gamepad_states[i]) {
          if (inDemo) {
            exitDemo()
            return
          }
          last_input_by_gamepad = true
          var new_state = gamepad_state.buttons[controller_map[i]].pressed
          if (i == 12) {
            if (!new_state) {
              openSettings()
            }
          } else {
            Keys[j] = new_state
          }
          last_gamepad_states[i] = new_state
          if (!new_state) {
            var code
            switch (i) {
              case 0:
                code = "&"
                break
              case 1:
                code = "("
                break
              case 2:
                code = "%"
                break
              case 3:
                code = "'"
                break
              default:
                if (controller_map[i] == gamepad_a) {
                  code = "A"
                } else if (controller_map[i] == gamepad_b) {
                  code = "B"
                }
                break
            }
            if (cheats[4].includes(code)) {
              if (cheats[4][cheati[4]] == code) {
                cheati[4]++
                if (cheati[4] >= cheats[4].length) {
                  activateCheat(4)
                }
              } else if (code == '&' && cheati[4] == 2) {
                // do nothing
              } else if (cheats[4][0] == code) {
                cheati[4]=1
              } else {
                cheati[4]=0
              }
            }
          }
        }
      }
      if (gamepad_has_axis) {
        axes_state = []
        for (var i = 0; i < 2; i++) {
          if (gamepad_state.axes[i] >= 0.5) {
            axes_state[i] = 1
          } else if (gamepad_state.axes[i] <= -0.5) {
            axes_state[i] = -1
          } else {
            axes_state[i] = 0
          }
        }
        if (axes_state[0] != last_gamepad_axes[0]) {
          if (inDemo) {
            exitDemo()
            return
          }
          last_input_by_gamepad = true
          Keys[K_LEFT] = false
          Keys[K_RIGHT] = false
          if (axes_state[0] > 0) {
            Keys[K_RIGHT] = true
          } else if (axes_state[0] < 0) {
            Keys[K_LEFT] = true
          }
        }
        if (axes_state[1] != last_gamepad_axes[1]) {
          if (inDemo) {
            exitDemo()
            return
          }
          last_input_by_gamepad = true
          Keys[K_UP] = false
          Keys[K_DOWN] = false
          if (axes_state[1] > 0) {
            Keys[K_DOWN] = true
          } else if (axes_state[1] < 0) {
            Keys[K_UP] = true
          }
        }
        last_gamepad_axes = axes_state
      }
  }
}