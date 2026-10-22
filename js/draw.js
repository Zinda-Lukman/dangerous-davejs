const SCREEN_END_LEVEL=1
const SCREEN_TITLE=2
const SCREEN_WARP_ZONE=3
const SCREEN_HIGH_SCORES=4
const SCREEN_WIN=5
const SCREEN_CONTROL_PANEL=6
const SCREEN_KEYBOARD=7
const SCREEN_JOYSTICK=8
const SCREEN_JOYSTICK_RUMBLE=9
const SCREEN_GAME=0

var prevGun = false
var prevJetpack = 0

function draw() {
  if (freezeGame) {
    return
  }
  frame++
  // handle temporary invincibility granted by shop purchases
  if (window._invincibleTimer && window._invincibleTimer > 0) {
    window._invincibleTimer--
    if (window._invincibleTimer <= 0) {
      invincible = false
      console.log('[shop] temporary invincibility ended')
    }
  }
  doControllerStuff()
  if (playExplosion) {
    if ((explodeSnd.buffer && soundSystem == SNDSYS_BUFFER) || (explodeSnd.audio && soundSystem == SNDSYS_ELEMENT)) {
      explodeSnd.play()
      playExplosion = false
    }
  }
  if (gameWillSave) {
    if (!(startPause || dave.state != DaveStanding || pause || freezeGame || scrollCounter > 0 || customLevel || inDemo || daveScreen != SCREEN_GAME)) {
      saveGame()
    }
    gameWillSave = false
  }
  switch (daveScreen) {
   case SCREEN_GAME:
    if (graphicsSwitch) {
      if (!tileGfx.complete || !hudGfx.complete || !numberGfx.complete || !dave.img.complete || (enemies.length > 0 && !enemies[0].img.complete) || (enemyShots.length > 0 && !enemyShots[0].img.complete)) {
        return
      }
      updateTileCanvas()
      updateHud()
      graphicsSwitch = false
    }
    if (recordingDemo) {
      var i = 0
      if (Keys[K_UP]) {
        i += 1
      }
      if (Keys[K_DOWN]) {
        i += 2
      }
      if (Keys[K_LEFT]) {
        i += 4
      }
      if (Keys[K_RIGHT]) {
        i += 8
      }
      if (Keys[K_GUN]) {
        i += 16
      }
      if (Keys[K_JETPACK]) {
        i += 32
      }
      recordedDemo.push(i)
      if (recordedDemo.length >= 2000) {
        pause=false
        inWarp=false
        usedWarp=false
        loadLevel(0)
        daveScreen=SCREEN_TITLE
        setMusic("title")
        menuFrame=0
        frame=0
        camera=0
        Keys[K_RET] = false
        KeysReR[K_RET] = false
        recordingDemo=false
        navigator.clipboard.writeText("demos["+currentLevel+"] = ["+recordedDemo.join(',')+"]")
      }
    } else if (inDemo) {
      Keys[K_UP] = !!(demos[currentLevel][demoFrame] & 1)
      Keys[K_DOWN] = !!(demos[currentLevel][demoFrame] & 2)
      Keys[K_LEFT] = !!(demos[currentLevel][demoFrame] & 4)
      Keys[K_RIGHT] = !!(demos[currentLevel][demoFrame] & 8)
      Keys[K_GUN] = !!(demos[currentLevel][demoFrame] & 16)
      Keys[K_JETPACK] = !!(demos[currentLevel][demoFrame] & 32)
      demoFrame++
      if (demoFrame >= demos[currentLevel].length) {
        exitDemo()
      }
    }
    ctx.fillRect(0,14,320,2)
    if (frame%8 == 0) {
      updateTileCanvasAnim()
    }
    ctx.drawImage(tileCanvas,camera*16,0,320,150,0,16,320,150)    
    camMult = camera*-16
    if (!startPause || frame%16 < 8) {
      dave.render(camMult)
    }
    if (pause) {
      if (Keys[K_N]) {
        pause=false
      } else if (Keys[K_ALT]) {
        pause=false
        altUnpause = 50
      } else if (Keys[K_Y] || Keys[K_CTRL]) {
        pause=false
        inWarp=false
        usedWarp=false
        loadLevel(0)
        daveScreen=SCREEN_TITLE
        setMusic("title")
        menuFrame=0
        frame=0
        camera=0
        Keys[K_RET] = false
        KeysReR[K_RET] = false
      }
      frame--
      subFrame++
      drawText("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",76,80,false)
      drawText("\x04                   \x05",76,88,false)
      drawText("\x04 quit? (y or n):" + String.fromCharCode(9+(Math.floor(subFrame/4)%6)) + "  \x05",76,96,false)
      drawText("\x04                   \x05",76,104,false)
      drawText("\x06\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x08",76,112,false)
      ctx.drawImage(hudCanvas,0,0,320,200,0,0,320,200)
      if (mobile_mode && !gamepad_fully_mapped) {
        ctx.drawImage(touchYesNo,0,0,320,200,0,0,320,200)
      }
      return
    } else if (Keys[K_ESC]) {
      if (lives < 0) {
        endGame(false)
        return
      } else {
        jumpSnd.stop()
        pause = true
        subFrame = 0
        return
      }
    }
    for (var i=0; i<explosions.length; i++) {
      explosions[i].render(camMult)
      if (frame % 8 == 0) {
        explosions[i].ix = (explosions[i].ix+20)%80
        if (!checkLand(explosions[i])) {
          explosions[i].y++
        }
        explosions[i].state++
        if (explosions[i].state >= 10) {
          explosions.splice(i,1)
          break
        }
      }
    }
    bullet.render(camMult)
    renderSprites(enemies,camMult)
    renderSprites(enemyShots,camMult)
    ctx.drawImage(hudCanvas,0,0,320,200,0,0,320,200)
    // trigger tutorials when items are acquired
    try {
      if (typeof tutorials !== 'undefined') {
        if (gun && !prevGun) {
          tutorials.triggerGun()
        }
        if (jetpack > 0 && (!prevJetpack || prevJetpack == 0)) {
          tutorials.triggerJetpack()
        }
      }
    } catch (e) {}
    prevGun = gun
    prevJetpack = jetpack
    // draw touch/tutorial overlays for mobile touch users
    try {
      var touch = (typeof isTouchDevice !== 'undefined') ? isTouchDevice : !!('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
      if (mobile_mode && touch && typeof tutorials !== 'undefined') {
        var t = tutorials
        if (t.showMovement && t.timers.movement > 0) {
          drawText("\x04 Swipe to move. Double-tap to shoot. \x05",36,168,true)
          t.timers.movement--
          if (t.timers.movement <= 0) t.markMovementShown()
        }
        if (t.showGun && t.timers.gun > 0) {
          drawText("\x04 Gun: Double-tap to shoot. \x05",44,152,true)
          t.timers.gun--
          if (t.timers.gun <= 0) t.showGun = false
        }
        if (t.showJetpack && t.timers.jetpack > 0) {
          drawText("\x04 Jetpack: Swipe up twice to boost. \x05",16,144,true)
          t.timers.jetpack--
          if (t.timers.jetpack <= 0) t.showJetpack = false
        }
      }
    } catch (e) {}
    if (mobile_mode && touchInputMode !== 'swipe') {
      if (!inDemo) {
        ctx.drawImage((gamepad_fully_mapped ? (gamepad_settings_mapped ? dummyGfx : touchGamepadInGame) : touchInGame),0,0,320,200,0,0,320,200)
      }
    }
    if (startPause) {
      if (pressAnyKey()) {
        startPause = false
        if (!checkLand(dave,false)) {
          fallSnd.play()
        }
      }
      return
    }
    if (scrollCounter > 0) {
      camera += scrollDirection
      camMult = camera*-16
      scrollCounter--
      if (camera <= 0 || camera >= 80) {
        scrollCounter=0
      }
      return
    }
    enemyTimer += 1
    if (enemyTimer>4) {
      enemyTimer=0
      for (var i=0;i<enemies.length;i++) {
        if (enemies[i].renderable) {
          if (spriteCol(enemies[i],bullet) && bullet.renderable) {
            addScore(100*currentLevel)
            explodeSnd.play()
            bullet.renderable=false
            bulletTimeout = 32
            enemies[i].renderable=false
            explosions[explosions.length] = new Sprite(enemies[i].x,enemies[i].y,20,13,0,0,20,13,"gfx/"+graphicsSet+"/explosion.png",true)
            enemyKills++
            continue
          } else if (spriteCol(enemies[i],dave)) {
            killDave(false)
            enemies[i].renderable=false
            explosions[explosions.length] = new Sprite(enemies[i].x,enemies[i].y,20,13,0,0,20,13,"gfx/"+graphicsSet+"/explosion.png",true)
            enemyKills++
            continue
          }
          enemies[i].x += levelData[loadedLevel][enemyPosition]
          enemies[i].y += levelData[loadedLevel][enemyPosition+1]
          enemies[i].ix = (Math.floor(frame/10)%4)*enemyWidths[loadedLevel]
          enemyShotTimers[i]--
          if (enemyShotTimers[i]<=0 && !enemyShots[i].renderable) {
            var sx=enemies[i].x>dave.x ? enemies[i].x-18 : enemies[i].x+15
            var sy=enemies[i].y+Math.floor(enemyHeights[loadedLevel]/2)
            if (isWithinCamera(sx) && distanceFromSolid(sx,sy,dave.x)>3) {
              enemyShots[i].iy = enemies[i].x>dave.x ? 3 : 0
              enemyShots[i].x = sx
              enemyShots[i].y = sy
              enemyShots[i].renderable = true
            }
          }
        }
      }
      enemyPosition += 2
      if (levelData[loadedLevel][enemyPosition] == -22 && levelData[loadedLevel][enemyPosition+1] == -22) {
        enemyPosition = 0
      }
    }
    if (bullet.renderable) {
      bullet.x += bullet.iy>0 ? -2 : 2
      if (!isWithinCamera(bullet.x) || spriteColWArray(bullet,enemies) || tileAt(bullet.x,bullet.y,false) == TINFO_SOLID || tileAt(bullet.x+7,bullet.y,false) == TINFO_SOLID) {
        bullet.renderable = false
        bulletTimeout = 32
      }
    }
    for (var i=0;i<enemyShots.length;i++) {
      if (enemyShots[i].renderable) {
        enemyShots[i].x += enemyShots[i].iy>0 ? -2 : 2
        enemyShots[i].ix = Math.floor((frame/4)%3)*19
        if (!isWithinCamera(enemyShots[i].x) || tileAt(enemyShots[i].x+1,enemyShots[i].y,false) == TINFO_SOLID || tileAt(enemyShots[i].x+18,enemyShots[i].y,false) == TINFO_SOLID) {
          enemyShots[i].renderable = false
          enemyShotTimers[i] = firingRates[loadedLevel]
        } else if (spriteCol(enemyShots[i],dave)) {
          enemyShots[i].renderable = false
          enemyShotTimers[i] = firingRates[loadedLevel]
          killDave(false)          
        }
      }
    } 
    if (killingDave) {
      if (sayOw) {
        owSnd.play()
      } else {
        explodeSnd.play()
      }
      killingDave = false
      vibrateController(1000,1.0)
      fallSnd.stop()
      jumpSnd.stop()
      dave.renderable = false
      dave.state = DaveDying
      explosions[explosions.length] = new Sprite(dave.x,dave.y,20,13,0,0,20,13,"gfx/"+graphicsSet+"/explosion.png",true)
      lives--
      if (lives < 0) {
        // Offer shop before final game over when running as a Telegram app
        if (typeof shopShown === 'undefined') shopShown = false
        if (!shopShown && typeof showShopModal === 'function') {
          clearMovementKeys()
          showShopModal()
          
        } else {
          setMusic("gameover")
        }
      }
      updateHud()
    }
    if (lives < 0) {
      if (explosions.length == 0 && (!music["gameover"] || music["gameover"].paused)) {
        endGame(false)
      }
      return
    }
    if (dave.state != DaveDying) {
      if (dave.x-(camera*16) >= 288 && camera < 80) {
        scrollCounter = 15
        scrollDirection = 1
      } else if (dave.x-(camera*16) <= 24 && camera > 0) {
        scrollCounter = 15
        scrollDirection = -1
      }
    }
    if (Keys[K_UP] && (dave.state == DaveStanding || dave.state == DaveWalking) && checkLand(dave,false)) {
      if (tileAt(dave.x+3,dave.y) == TINFO_CLIMB || tileAt(dave.x+3,dave.y) == TINFO_CLIMB) {
        dave.state = DaveClimbing
        subFrame=0
        dave.ix = ClimbAnim[0]
        fallSnd.stop()
        jumpSnd.stop()
      } else if ((tileAt(dave.x+3,dave.y-1) != TINFO_SOLID && tileAt(dave.x+13,dave.y-1) != TINFO_SOLID)) {
        if (tileAt(dave.x+2,dave.y-1) == TINFO_SOLID) {
          dave.x = (Math.floor((dave.x+16)/16)*16)-1
        } else if (tileAt(dave.x+14,dave.y-1) == TINFO_SOLID) {
          dave.x = (Math.floor(dave.x/16)*16)+1
        }
        dave.ix = JumpAnim
        dave.state = DaveJumping
        jumpSnd.play()
        daveYVelocity = -1
        daveYDistance = 0
      } else if ((frame % 4) == 0) {
        bumpSnd.play()
      }
    }
    if (altUnpause>0) {
      altUnpause--
    } else if (Keys[K_ALT] && !KeysReR[K_ALT]) {
      KeysReR[K_ALT] = true
      if (jetpack>0 && dave.state != DaveDying && dave.state != DaveFlying) {
        dave.state = DaveFlying
        vibrateController(250,1.0)
        toJetPackSnd.play()
        fallSnd.stop()
        jumpSnd.stop()
        subFrame = 0
      } else if (dave.state == DaveFlying) {
        dave.state = DaveStanding
        dave.ix = 0
      }
    } else if (!Keys[K_ALT] && KeysReR[K_ALT]) {
      KeysReR[K_ALT] = false
    }
    if (gun && Keys[K_CTRL] && !bullet.renderable && bulletTimeout<=0 && dave.state != DaveDying) {
      vibrateController(100,1.0)
      bullet.iy = daveFacing<0 ? 3 : 0
      bullet.x = daveFacing<0 ? (dave.x-8) : (dave.x+16)
      bullet.y = dave.y+7
      bullet.renderable = true
    } else {
      bulletTimeout--
    }
    if (dave.x<0 || dave.x>=1600) {
      if (levelWarp[currentLevel]>0 && !usedWarp) {
        jumpSnd.stop()
        fallSnd.play()
        daveScreen=SCREEN_WARP_ZONE
        setMusic("inter")
        menuFrame=0
        inWarp=true
        loadLevel(levelWarp[currentLevel])
        interDave.x=144
        interDave.y=-16
        interDave.ix = ForwardAnim
      } else if (dave.x < 0) {
        dave.x=0
      } else {
        dave.x=1600
      }
    }
    if (dave.state == DaveStanding) {
      if (Keys[K_RIGHT]) {
        subFrame = 0
        dave.state = DaveWalking
        daveFacing = 1
        dave.iy = 0
      } else if (Keys[K_LEFT]) {
        subFrame = 0
        dave.state = DaveWalking
        daveFacing = -1
        dave.iy = 16
      }
      if (!checkLand(dave,false)) {
        fallSnd.play()
        daveFacing=0
        dave.state = DaveFalling
        daveYDistance=0
      }
    } else if (dave.state == DaveWalking) {
      subFrame++
      if ((daveFacing < 0 && tileAt(dave.x,dave.y) == TINFO_SOLID) || (daveFacing > 0 && tileAt(dave.x+15,dave.y) == TINFO_SOLID)) {
        if ((subFrame % 4) == 0) {
          bumpSnd.play()
        }
      } else if (!invincible && (tileAt(dave.x,dave.y) == TINFO_KILLS || tileAt(dave.x+15,dave.y) == TINFO_KILLS)) {
        killDave(true)
        return
      } else {
        if ((dave.x % 6) == 0) {
          stepSnd.play()
          daveAnim = (daveAnim+1)%4
          dave.ix = WalkAnim[daveAnim]
        }
        dave.x += daveFacing
      }
      if (!checkLand(dave,false)) {
        fallSnd.play()
        daveFacing=0
        dave.state = DaveFalling
        dave.ix=0
        daveYDistance=0
      } else if ((daveFacing>0 && !Keys[K_RIGHT]) || (daveFacing<0 && !Keys[K_LEFT])) {
        dave.state = DaveStanding
      }
    } else if (dave.state == DaveJumping) {
      if (daveYVelocity < 0) {
        if (frame%(17-Math.floor(daveYDistance/2)) != 0) {
          daveYDistance++
          dave.y--
        }
        if (daveYDistance >= 32) {
          daveYVelocity = 0
        }
      } else if (daveYVelocity > 0) {
        if (frame%(17-Math.floor(daveYDistance/2)) != 0) {
          daveYDistance--
          dave.y++
        }
        if (daveYDistance <= 0) {
          daveYDistance = 1
        }
      } else {
        daveYDistance++
        if (daveYDistance >= 46) {
          daveYDistance = 31
          daveYVelocity = 1
        }
        if (Keys[K_UP] && (tileAt(dave.x+3,dave.y) == TINFO_CLIMB || tileAt(dave.x+3,dave.y) == TINFO_CLIMB)) {
          dave.state = DaveClimbing
          subFrame=0
          dave.ix = ClimbAnim[0]
          fallSnd.stop()
          jumpSnd.stop()
        }
      }
      if (daveYVelocity < 0 && (tileAt(dave.x+3,dave.y) == TINFO_SOLID || tileAt(dave.x+13,dave.y) == TINFO_SOLID)) {
        daveYDistance = 1
        daveYVelocity = 1
        dave.y = (Math.floor(dave.y/16)*16)+16
      } else if (daveYVelocity > 0 && checkLand(dave)) {
        jumpSnd.stop()
        stepSnd.play()
        dave.state = DaveStanding
        dave.ix = StandAnim
        dave.y = (Math.floor(dave.y/16)*16)
      }
      if (Keys[K_RIGHT] && tileAt(dave.x+15,dave.y+15) != TINFO_SOLID && tileAt(dave.x+15,dave.y) != TINFO_SOLID) {
        daveFacing = 1
        dave.iy = 0
        dave.x++
      } else if (Keys[K_LEFT] && tileAt(dave.x+1,dave.y+15) != TINFO_SOLID && tileAt(dave.x+1,dave.y) != TINFO_SOLID) {
        daveFacing = -1
        dave.iy = 16
        dave.x--
      }
      if (killingDave && daveYVelocity>0 && (dave.y+1)%16 < 2) {
        killingDave = false
      }
    } else if (dave.state == DaveFalling) {
      dave.y++
      daveYDistance++
      if (daveFacing>0 && tileAt(dave.x+15,dave.y+15) != TINFO_SOLID && tileAt(dave.x+15,dave.y) != TINFO_SOLID) {
        dave.x++
      } else if (daveFacing<0 && tileAt(dave.x+1,dave.y+15) != TINFO_SOLID && tileAt(dave.x+1,dave.y) != TINFO_SOLID) {
        dave.x--
      } else {
        daveFacing = 0
      }
      if (Keys[K_RIGHT] && daveYDistance>1) {
        daveFacing = 1
        dave.iy = 0
      } else if (Keys[K_LEFT] && daveYDistance>1) {
        daveFacing = -1
        dave.iy = 16
      }
      if (checkLand(dave)) {
        fallSnd.stop()
        stepSnd.play()
        dave.state = DaveStanding
        if (daveFacing>0) {
          dave.ix = StandAnim
          dave.iy = 0
        } else if (daveFacing>0) {
          dave.ix = StandAnim
          dave.iy = 16
        } else {
          daveFacing = dave.iy>0 ? -1 : 1
          dave.ix = ForwardAnim
          dave.iy = daveFacing>0 ? 0 : 16
        }
      }
      if (killingDave && (dave.y+1)%16 < 2) {
        killingDave = false
      }
    } else if (dave.state == DaveFlying) {
      subFrame++
      if (subFrame>5) {
        if ((subFrame % 4) == 0) {
          if (subFrame%20 == 0) {
            flyingSnd.play()
            vibrateController(250,0.5)
          }
          daveAnim = (daveAnim+1)%4
          dave.ix = JetAnim[daveAnim]
        }
      } else {
        daveAnim = (daveAnim+1)%4
        dave.ix = JetAnim[daveAnim]
      }
      if (jetpack<=0) {
        fallSnd.play()
        daveFacing=0
        dave.state = DaveFalling
        dave.ix=0
        daveYDistance=0
      } else if (Keys[K_RIGHT] && tileAt(dave.x+15,dave.y+15) != TINFO_SOLID && tileAt(dave.x+15,dave.y+1) != TINFO_SOLID) {
        daveFacing = 1
        dave.iy = 0
        dave.x++
      } else if (Keys[K_LEFT] && tileAt(dave.x+1,dave.y+15) != TINFO_SOLID && tileAt(dave.x+1,dave.y+1) != TINFO_SOLID) {
        daveFacing = -1
        dave.iy = 16
        dave.x--
      } else if (Keys[K_DOWN] && !checkLand(dave)) {
        dave.y++
      } else if (Keys[K_UP] && (tileAt(dave.x+2,dave.y) != TINFO_SOLID && tileAt(dave.x+14,dave.y) != TINFO_SOLID)) {
        dave.y--
        if (killingDave && dave.y%16>14) {
          killingDave = false
        }
      }
      if (subFrame%10==0) {
        jetpack--
        updateHud()
      }
    } else if (dave.state == DaveClimbing) {
      if (Keys[K_RIGHT] || Keys[K_LEFT] || Keys[K_UP] || Keys[K_DOWN]) {
        subFrame++
        if ((subFrame % 4) == 0) {
          stepSnd.play()
          daveAnim = (daveAnim+1)%4
          dave.ix = ClimbAnim[daveAnim]
        }
      }
      if (Keys[K_RIGHT] && tileAt(dave.x+15,dave.y+15) != TINFO_SOLID && tileAt(dave.x+15,dave.y+1) != TINFO_SOLID) {
        daveFacing = 1
        dave.iy = 0
        dave.x++
      } else if (Keys[K_LEFT] && tileAt(dave.x+1,dave.y+15) != TINFO_SOLID && tileAt(dave.x+1,dave.y+1) != TINFO_SOLID) {
        daveFacing = -1
        dave.iy = 16
        dave.x--
      } else if (Keys[K_DOWN] && !checkLand(dave)) {
        dave.y++
      } else if (Keys[K_UP] && (tileAt(dave.x+2,dave.y) != TINFO_SOLID && tileAt(dave.x+14,dave.y) != TINFO_SOLID)) {
        dave.y--
      }
      if (tileAt(dave.x+2,dave.y) != TINFO_CLIMB && tileAt(dave.x+14,dave.y) != TINFO_CLIMB && tileAt(dave.x+2,dave.y+15) != TINFO_CLIMB && tileAt(dave.x+14,dave.y+15) != TINFO_CLIMB) {
        if (Keys[K_UP]) {
          dave.ix = JumpAnim
          dave.state = DaveJumping
          jumpSnd.play()
          daveYVelocity = -1
          daveYDistance = 0
        } else {
          dave.state = DaveFalling
          fallSnd.play()
        }
      }
    } else if (dave.state == DaveDying) {
      if (explosions.length == 0) {
        if (customLevel) {
          dave.x = customStartX*16
          dave.y = customStartY*16
          camera = 0
          while (customStartX >= camera+20) {
            camera += 10
          }
        } else if (inWarp) {
          dave.x = warpX[currentLevel]*16
          dave.y = 0
          camera = warpCam[currentLevel]
        } else {
          dave.x = startX[currentLevel]*16
          dave.y = startY[currentLevel]*16
          camera = 0
        }
        camMult = camera*-16
        dave.renderable = true
        dave.state = DaveStanding
        dave.ix = ForwardAnim
        startPause = true
      }
    }
    if (dave.y >= 160) {
      dave.y -= 256
    }
    break
   case SCREEN_END_LEVEL:
    if (menuFrame == 0) {
      subFrame = 0
      ctx.fillRect(0,0,320,200)
      ctx.drawImage(hudCanvas,0,0,320,200,0,0,320,200)
      ctx.drawImage(tileGfx, 32, 0, 16, 16, 0, 80, 16, 16)
      for (var i=0; i<20; i++) {
        ctx.drawImage(tileGfx, 80, 0, 16, 16, i*16, 64, 16, 16)
        ctx.drawImage(tileGfx, 80, 0, 16, 16, i*16, 96, 16, 16)
      }
      if (tally >= 0) {
        drawText((inWarp ? "warp" : "level")+" "+currentLevel+" finished",96,56,true)
      } else if (inWarp || customLevel) {
      } else if (currentLevel == 9) {
        drawText("this is the last level!!!",56,56,true)
      } else if (currentLevel == 10) {
        drawText("yes! you finished the game!",48,56,true)
      } else {
        drawText("good work! only "+(10-currentLevel)+" more to go!",48,56,true)
      }
      if (tally >= 0) {
        interDave.ix=20
        interDave.render(0)
        if (endResults[tally] == 0) {
          explodeSnd.play()
        }
        if (endTally[0] == 0 || endResults[0] == 0) {
          drawText("kills: 0%",120,120,true)
        }
        if (tally >= 1) {
          drawText("kills: " + Math.round((endResults[0]/endMax[0])*100) + "%",120,120,true)
          if (endTally[1] == 0 || endResults[1] == 0) {
            drawText("items: 0%",120,136,true)
          }
          if (tally >= 2) {
            drawText("items: " + Math.round((endResults[1]/endMax[1])*100) + "%",120,136,true)
            if (endTally[2] == 0 || endResults[2] == 0) {
              drawText("score: 0%",120,152,true)
            }
            if (tally >= 3) {
              drawText("score: " + Math.round((endResults[2]/endMax[2])*100) + "%",120,152,true)
            }
          }
        }
      } else {
        levelDoneSnd.play()
        scoreIncrements=[]
        scoreIncrementIndex=0
      }
      menuFrame++
    }
    if (tally >= 3) {
      if (pressAnyKey()) {
        tally = -1
        menuFrame = 0
        interDave.ix=0
      }
    } else if (tally >= 0) {
      menuFrame++
      subFrame++
      if (endTally[tally] < endResults[tally] && subFrame >= 5) {
        endTally[tally] += (tally == 2 ? scoreIncrements[scoreIncrementIndex++] : 1)
        drawText(tallyNames[tally] + ": " + Math.round((endTally[tally]/endMax[tally])*100) + "%",120,120+(tally*16),true)
        if (endTally[tally] == endResults[tally]) {
          explodeSnd.play()
          subFrame = 0
        } else {
          toJetPackSnd.play()
          subFrame = 0
        }
      } else if (subFrame >= 50) {
        menuFrame = 0
        subFrame = 0
        tally++
      }
    } else {
      ctx.fillRect(interDave.x,interDave.y+16,16,16)
      interDave.render(0)
      if (frame%8 == 0) {
        interDave.ix=WalkAnim[(frame/8)%4]
        stepSnd.play()
      }
      interDave.x++
      if (interDave.x >= 304) {
        dave.ix = ForwardAnim
        if (customLevel) {
          loadLevel(0)
          frame=0
          menuFrame=0
          daveScreen = SCREEN_TITLE;      
          setMusic("title")
        } else if (inWarp) {
          inWarp = false
          daveScreen = SCREEN_GAME
          setMusic("level"+currentLevel)
        } else if (currentLevel < 10) {
          currentLevel++
          daveScreen = SCREEN_GAME
          setMusic("level"+currentLevel)
        } else {
          loadLevel(11)
          daveScreen = SCREEN_WIN
          setMusic("win")
          menuFrame = 0
          inWarp = false
          if (Keys[K_SPACE]) {
            KeysReR[K_SPACE] = true
          }
        }
        updateHud()
      }
    }
    break
   case SCREEN_TITLE:
    if (graphicsSwitch) {
      if (!tileGfx.complete || !titleGfx.complete || !fontGfx.complete) {
        return
      }
      graphicsSwitch = false
    }
    if (menuFrame==0) {
      frame=0
      idle=0
      ctx.fillRect(0,0,320,200)
      renderTiles()
      ctx.fillRect(80,166,160,10)
      // Show touch instructions for touch devices / mobile mode
      try {
        if (mobile_mode || (typeof touchInputMode !== 'undefined' && touchInputMode === 'swipe')) {
          drawText("touch:swipe up/down, double-tap to select",56,160,true)
        }
      } catch (e) { }
      drawText("ARROWS                          RETURN",8,168,true)
      drawText("MOVE                           SELECTS",8,176,true)
      drawText("F1 = HELP",8,192,true)
      drawText("ORIGINALLY BY JOHN ROMERO",64,48,true)
      drawText("PORTED BY MELODIC SPACESHIP",56,56,true)
      drawText("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",80,168,false)
      //                                                         ____________resume game
      drawText("\x04 " + String.fromCharCode(selectedItem == 0 ? 9 : 32) + " "+(localStorage.getItem("dave-save") ? "resume game" : "start game ")+"    \x05",80,176,false)
      drawText("\x04 " + String.fromCharCode(selectedItem == 1 ? 9 : 32) + " high scores    \x05",80,184,false)
      drawText("\x04 " + String.fromCharCode(selectedItem == 2 ? 9 : 32) + " select Level  \x05",80,192,false)
    }
    if (frame%8 == 0) {
      renderTilesFast()
      ctx.fillRect(208,166,16,2)
      drawText("\x02\x02",208,168,false)
    }
    if (frame%6 == 0) {
      ctx.drawImage(titleGfx, (Math.floor(frame/6)%4)*112, 0, 112, 48, 104, 0, 112, 48)
    }
    if (frame%4 == 0) {
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),96,176+(selectedItem*8),false)
    }
    menuFrame++
    if (Keys[K_LEFT] || Keys[K_RIGHT] || Keys[K_DOWN] || Keys[K_UP] || Keys[K_ALT] || Keys[K_CTRL] || Keys[K_RET] || Keys[K_SPACE]) {
      idle=0
      if (Keys[K_LEFT]) {
        KeysReR[K_LEFT] = true
      } else if (Keys[K_RIGHT]) {
        KeysReR[K_RIGHT] = true
      } else if (Keys[K_DOWN] && !KeysReR[K_DOWN]) {
        drawText(" ",96,176+(selectedItem*8),false)
        selectedItem = (selectedItem+1)%3
        drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),96,176+(selectedItem*8),false)
        KeysReR[K_DOWN] = true
      } else if (Keys[K_UP] && !KeysReR[K_UP]) {
        drawText(" ",96,176+(selectedItem*8),false)
        selectedItem -= 1
        if (selectedItem<0) selectedItem = 2
        drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),96,176+(selectedItem*8),false)
        KeysReR[K_UP] = true
      } else if (Keys[K_RET] && !KeysReR[K_RET]) {
        KeysReR[K_RET] = true
        if (selectedItem == 0) {
          if (localStorage.getItem("dave-save")) {
            resumeGame()
          } else {
            daveScreen = SCREEN_GAME
            lives = 3
            score = 0
            currentLevel = 1
            lifeAt = 20000
            disqualified=false
            invincible=false
            updateHud()
            loadLevel(1)
            setMusic("level1")
          }
        } else if (selectedItem == 1) {
          menuFrame = 0
          daveScreen = SCREEN_HIGH_SCORES
          setMusic("scores")
        } else {
          KeysReR[K_RET] = false
          Keys[K_RET] = false
          showSavedLevelsModal()
        }
      } else if (Keys[K_ALT]) {
        KeysReR[K_ALT] = true
      } else if (Keys[K_CTRL]) {
        KeysReR[K_CTRL] = true
      } else if (Keys[K_SPACE]) {
        KeysReR[K_SPACE] = true
      }
    } else if (!Keys[K_DOWN] && KeysReR[K_DOWN]) {
      KeysReR[K_DOWN] = false
    } else if (!Keys[K_UP] && KeysReR[K_UP]) {
      KeysReR[K_UP] = false
    } else if (!Keys[K_RET] && KeysReR[K_RET]) {
      KeysReR[K_RET] = false
    } else {
      idle++
      if (idle==1000) {
        idle=0
        startDemo()
      }
    }
    break
   case SCREEN_WARP_ZONE:
    if (menuFrame==0) {
      ctx.fillRect(0,0,320,200)
      ctx.drawImage(warpZoneGfx, 0, 0, 234, 16, 32, 90, 234, 16)
      for (var i=1; i<11; i++) {
        ctx.drawImage(tileGfx, warpTiles[currentLevel]*16, 0, 16, 16, 128, i*16, 16, 16)
        ctx.drawImage(tileGfx, warpTiles[currentLevel]*16, 0, 16, 16, 160, i*16, 16, 16)
      }
      menuFrame++
    }
    ctx.fillRect(interDave.x,0,16,200)
    interDave.render(0)
    interDave.y++
    ctx.drawImage(hudCanvas,0,0,320,200,0,0,320,200)
    if (interDave.y >= 160) {
      inWarp = true
      usedWarp = true
      daveScreen = SCREEN_GAME
      if (music["warp"]) {
        setMusic("warp")
      } else {
        setMusic("level"+levelWarp[currentLevel])
      }
      Keys[K_SPACE] = false
      scoreIncrements=[]
      scoreIncrementIndex=0
      updateHud()
    }
    break
   case SCREEN_HIGH_SCORES:
    if(menuFrame==0) {
      toJetPackSnd.play()
      ctx.fillRect(0,0,320,200)
      drawText("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",80,0,false)
      drawText("\x04the most dangerous\x05",80,8,false)
      drawText("\x06\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x08",80,16,false)
      drawText("name",0,24,true)
      drawText("score",160,24,true)
      drawText("level",240,24,true)
    } else if (menuFrame<=100 && menuFrame%10==0 && menuFrame > 0) {
      treasureSnd.play()
      i = (menuFrame/10)-1
      drawText(scores[2][i],0,40+(i*16),true)
      drawText(""+scores[0][i],200-(scores[0][i].toString().length*8),40+(i*16),true)
      drawText(""+scores[1][i],240,40+(i*16),true)
    }
    menuFrame++
    if (pressAnyKey()) {
      if (Keys[K_RET]) {
        KeysReR[K_RET] = true
      }
      Keys[K_UP] = false
      KeysReR[K_UP] = false
      Keys[K_DOWN] = false
      KeysReR[K_DOWN] = false
      Keys[K_LEFT] = false
      KeysReR[K_LEFT] = false
      Keys[K_RIGHT] = false
      KeysReR[K_RIGHT] = false
      Keys[K_RET] = false
      daveScreen = SCREEN_TITLE
      setMusic("title")
      menuFrame = 0
    }
    break
   case SCREEN_WIN:
    if (menuFrame == 0) {
      ctx.fillRect(0,0,320,200)
      renderTiles()

      drawText("congratulations!",96,40,true)

      drawText("you made it through all the peril-",24,64,true)
      drawText("ous areas in clyde's hideout!",24,72,true)

      drawText("very good work! did you find",24,88,true)
      drawText("the 4 warp zones? they are located",24,96,true)
      drawText("on levels 5,8,9 and 10. just jump",24,104,true)
      drawText("off the top of the screen at the",24,112,true)
      drawText("extreme left or right edge of the",24,120,true)
      drawText("world and voila! you're there!",24,128,true)

      if (mobile_mode) {
        drawText("tap the screen",104,152,true)
      } else {
        drawText("press space",112,152,true)
      }

      menuFrame++
    } else if (frame%8 == 0) {
      renderTilesFast()
    }

    if (Keys[K_SPACE] && !KeysReR[K_SPACE]) {
      KeysReR[K_SPACE] = true
    } else if (!Keys[K_SPACE] && KeysReR[K_SPACE]) {
      endGame(true)
      KeysReR[K_SPACE] = false
    }
    break
   case SCREEN_CONTROL_PANEL:
    if (menuFrame == 0) {
      if (!fontGfx.complete || !menuGfx.complete) {
        return
      }

      drawText("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",0,0,false)
      for (i=8; i<192; i+=8) {
        drawText("\x04                                      \x05",0,i,false)
      }
      drawText("\x06\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x08",0,192,false)
      drawText("js-arcade control panel",64,16,false)
    
      drawText("video:",16,48,false)
      for (var i=0;i<3;i++) {
        ctx.drawImage(menuGfx,0,i*24,32,24,112+(i*48),32,32,24)
      }

      drawText("size:",16,72,false)
      drawText("1x    2x    3x    4x",120,72,false)

      drawText("ratio:",16,88,false)
      drawText("16:10   4:3",104,88,false)

      drawText("control:",16,128,false)
		  for (var i=0;i<2;i++) {
        ctx.drawImage(menuGfx,0,168+(i*24),32,24,112+(i*48),112,32,24)
		  }

		  if (mobile_mode) {
        ctx.drawImage(menuGfx,0,96,32,24,112,112,32,24)			
		  }      
      if (!found_gamepad) {
        ctx.drawImage(menuGfx,0,96,32,24,160,112,32,24)			
		  }

      for (var i=0;i<3;i++) {
        drawText("\x0F",120+(settingsAt[i]*48),settingsPositions[i],false)
      }

      drawText("move the cursor with the arrow keys",24,168,false)
      drawText("make decisions with the enter key",32,176,false)
      drawText("esc to return to your game",64,184,false)
      menuFrame++
    }
    if (frame%4 == 0 || mobile_mode) {
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),128+(settingsX*48),settingsPositions[settingsY],false)
    }
    if (Keys[K_ESC] && !KeysReR[K_ESC]) {
      KeysReR[K_ESC] = true
    } else if (!Keys[K_ESC] && KeysReR[K_ESC]) {
      KeysReR[K_ESC] = false
      daveScreen = previousScreen
      menuFrame = 0
      selectedItem = 0
      exportScores()
    } else if (Keys[K_LEFT] && !KeysReR[K_LEFT]) {
      KeysReR[K_LEFT] = true
    } else if (!Keys[K_LEFT] && KeysReR[K_LEFT]) {
      KeysReR[K_LEFT] = false
      drawText(" ",128+(settingsX*48),settingsPositions[settingsY],false)
      settingsX--
      if (settingsX<0) settingsX=settingsLimits[settingsY]
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),128+(settingsX*48),settingsPositions[settingsY],false)
    } else if (Keys[K_RIGHT] && !KeysReR[K_RIGHT]) {
      KeysReR[K_RIGHT] = true
    } else if (!Keys[K_RIGHT] && KeysReR[K_RIGHT]) {
      KeysReR[K_RIGHT] = false
      drawText(" ",128+(settingsX*48),settingsPositions[settingsY],false)
      settingsX++
      if (settingsX>settingsLimits[settingsY]) settingsX=0
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),128+(settingsX*48),settingsPositions[settingsY],false)
    } else if (Keys[K_UP] && !KeysReR[K_UP]) {
      KeysReR[K_UP] = true
    } else if (!Keys[K_UP] && KeysReR[K_UP]) {
      KeysReR[K_UP] = false
      drawText(" ",128+(settingsX*48),settingsPositions[settingsY],false)
      settingsY--
      if (settingsY<0) settingsY=3
      if (settingsX>settingsLimits[settingsY]) settingsX=settingsLimits[settingsY]
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),128+(settingsX*48),settingsPositions[settingsY],false)
    } else if (Keys[K_DOWN] && !KeysReR[K_DOWN]) {
      KeysReR[K_DOWN] = true
    } else if (!Keys[K_DOWN] && KeysReR[K_DOWN]) {
      KeysReR[K_DOWN] = false
      drawText(" ",128+(settingsX*48),settingsPositions[settingsY],false)
      settingsY++
      if (settingsY>3) settingsY=0
      if (settingsX>settingsLimits[settingsY]) settingsX=settingsLimits[settingsY]
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),128+(settingsX*48),settingsPositions[settingsY],false)
    } else if (Keys[K_RET] && !KeysReR[K_RET]) {
      KeysReR[K_RET] = true
    } else if (!Keys[K_RET] && KeysReR[K_RET]) {
      KeysReR[K_RET] = false
      if (settingsY < 3) {
        drawText(" ",120+(settingsAt[settingsY]*48),settingsPositions[settingsY],false)
        settingsAt[settingsY]=settingsX
        drawText("\x0F",120+(settingsAt[settingsY]*48),settingsPositions[settingsY],false)
        if (settingsY == 0) {
          switchGraphics(graphicsSets[settingsX])
        } else {
          var w = 320
          var h = 200
          if (settingsAt[2] == 1) {
            h = 240
          }
          w *= (settingsAt[1]+1)
          h *= (settingsAt[1]+1)
          setRes(w,h)
        }
      } else if (settingsY == 3) {
        if (settingsX == 0 && !mobile_mode) {
          daveScreen = SCREEN_KEYBOARD
          menuFrame = 0
          //drawText(" ",128,136,false)
		    } else if (settingsX == 1 && found_gamepad) {
          daveScreen = SCREEN_JOYSTICK
          menuFrame = 0
          drawText(" ",176,136,false)
          controller_map = []
          gamepad_new_button = -1
          gamepad_fully_mapped = true
          gamepad_settings_mapped = true
        } else {
			    bumpSnd.play()
		    }
      }
    }
    break
   case SCREEN_KEYBOARD:
    if (menuFrame == 0) {
      drawText("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",64,32,false)
      drawText("\x04keyboard configuration \x05",64,40,false)
      drawText("\x04---------------------- \x05",64,48,false)
      drawText("\x040 up       :           \x05",64,56,false)
      drawText("\x041 down     :           \x05",64,64,false)
      drawText("\x042 left     :           \x05",64,72,false)
      drawText("\x043 right    :           \x05",64,80,false)
      drawText("\x044 gun      :           \x05",64,88,false)
      drawText("\x045 jetpack  :           \x05",64,96,false)
      drawText("\x046 jump     :           \x05",64,104,false)
      drawText("\x04                       \x05",64,112,false)
      if (keyRedefine >= 0) {
        drawText("\x04modify which action:"+keyRedefine+"  \x05",64,120,false)
        drawText("\x04press the new key:     \x05",64,128,false)
      } else {
        drawText("\x04modify which action:   \x05",64,120,false)
        drawText("\x04                       \x05",64,128,false)
      }
      drawText("\x06\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x08",64,136,false)

      for (var i=0;i<7;i++) {
        var k = keyStrings[keyMap[i]]
        if (k == undefined) {
          k = "Key "+keyMap[i]
        }
        drawText(k,176,56+(i*8))
      }

      menuFrame++
    }
    if (keyRedefine == -2) {
      menuFrame = 0
      keyRedefine = -1
    } else if (keyRedefine == -1) {
      if (frame%4 == 0) {
        drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),232,120,false)
      }
      if (Keys[K_ESC] && !KeysReR[K_ESC]) {
        KeysReR[K_ESC] = true
      } else if (!Keys[K_ESC] && KeysReR[K_ESC]) {
        KeysReR[K_ESC] = false
        daveScreen = SCREEN_CONTROL_PANEL
        menuFrame = 0
        exportScores()
      }
    }
    break
   case SCREEN_JOYSTICK:
    var label = keyLabels[controller_map.length]
    if (menuFrame == 0) {
      drawText("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",64,32,false)
      drawText("\x04joystick configuration \x05",64,40,false)
      drawText("\x04---------------------- \x05",64,48,false)
      drawText("\x04press new button for   \x05",64,56,false)
      drawText("\x04                       \x05",64,64,false)
      drawText(label+":",72,64,false)
      drawText("\x04                       \x05",64,72,false)      
      drawText("\x04press esc to leave     \x05",64,80,false)      
      drawText("\x04unmapped               \x05",64,88,false)      
      drawText("\x06\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x08",64,96,false)
    }
    if (frame%4 == 0) {
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),80+(label.length*8),64,false)
    }
    menuFrame++
    var gamepad_state = navigator.getGamepads()[used_gamepad.index]
    if (gamepad_new_button >= 0) {
      if (!gamepad_state.buttons[gamepad_new_button].pressed) {
        if (controller_map.includes(gamepad_new_button)) {
          gamepad_fully_mapped = false
        }
        controller_map[controller_map.length] = gamepad_new_button
        menuFrame = 0
        gamepad_new_button = -1
        if (controller_map.length > 12) {
          daveScreen = (gamepad_has_rumble ? SCREEN_JOYSTICK_RUMBLE : SCREEN_CONTROL_PANEL)
          exportScores()
        }
      }
    } else {
      if (Keys[K_ESC] && !KeysReR[K_ESC]) {
        KeysReR[K_ESC] = true
      } else if (!Keys[K_ESC] && KeysReR[K_ESC]) {
        KeysReR[K_ESC] = false
        if (controller_map.length >= 12) {
          controller_map[controller_map.length] = -6
          gamepad_settings_mapped = false
        } else if (controller_map.length < 4) {
          controller_map[controller_map.length] = (-2)-controller_map.length
        } else {
          controller_map[controller_map.length] = -1
          gamepad_fully_mapped = false
        }
        menuFrame = 0
        if (controller_map.length > 12) {
          daveScreen = (gamepad_has_rumble ? SCREEN_JOYSTICK_RUMBLE : SCREEN_CONTROL_PANEL)
          exportScores()
        }
      } else {
        for (var i = 0; i < gamepad_state.buttons.length; i++) {
          if (gamepad_state.buttons[i].pressed) {
            gamepad_new_button = i
            break
          }
        }
      }
    }
    break
   case SCREEN_JOYSTICK_RUMBLE:
    if (menuFrame == 0) {
      drawText("\x04                       \x05",64,56,false)
      drawText("\x04enable rumble?         \x05",64,64,false)
      drawText("\x04                       \x05",64,72,false)      
      drawText("\x04press y/enter or n/esc \x05",64,80,false)      
      drawText("\x04                       \x05",64,88,false)
    }
    if (frame%4 == 0) {
      drawText(String.fromCharCode(9+(Math.floor(frame/4)%6)),184,64,false)
    }
    menuFrame++
    if ((Keys[K_ESC] || Keys[K_N]) && !KeysReR[K_ESC]) {
      KeysReR[K_ESC] = true
    } else if (!(Keys[K_ESC] || Keys[K_N]) && KeysReR[K_ESC]) {
      KeysReR[K_ESC] = false
      rumble_enabled = false
      menuFrame = 0
      daveScreen = SCREEN_CONTROL_PANEL
      exportScores()
    }
    if ((Keys[K_RET] || Keys[K_Y]) && !KeysReR[K_RET]) {
      KeysReR[K_RET] = true
    } else if (!(Keys[K_RET] || Keys[K_Y]) && KeysReR[K_RET]) {
      KeysReR[K_RET] = false
      rumble_enabled = true
      vibrateController(1000,1.0)
      menuFrame = 0
      daveScreen = SCREEN_CONTROL_PANEL
      exportScores()
    }
    break
  }
  if (mobile_mode) {
    if ((daveScreen == SCREEN_TITLE || daveScreen == SCREEN_CONTROL_PANEL || daveScreen == SCREEN_JOYSTICK_RUMBLE) && !gamepad_fully_mapped) {
      ctx.drawImage(touchMenu,0,0,320,200,0,0,320,200)
    } else if (daveScreen == SCREEN_JOYSTICK) {
      ctx.drawImage(touchGamepadConfig,0,0,320,200,0,0,320,200)
    }
  }
}
