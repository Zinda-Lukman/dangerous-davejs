//This is notably the only item the game stores in local storage that is managed separately from the rest of the local storage.

function saveGame() { 
  var saveArray = []
  saveArray.push(frame)
  saveArray.push(subFrame)
  for (var y = 0; y<10; y++) {
    for (var x = 0; x<100; x++) {
      saveArray.push(levelTiles[y][x])
    }
  }
  saveArray.push(currentLevel)
  saveArray.push(loadedLevel)
  saveArray.push(inWarp)
  saveArray.push(usedWarp)
  saveArray.push(camera)
  saveArray.push(camMult)
  saveArray.push(disqualified)
  saveArray.push(score)
  saveArray.push(levelScore)
  saveArray.push(levelTotalScore)
  saveArray.push(scoreIncrements.join("+"))
  saveArray.push(levelItems)
  saveArray.push(levelTotalItems)
  saveArray.push(enemyKills)
  saveArray.push(enemyMaxKills)
  saveArray.push(lives)
  saveArray.push(lifeAt)
  saveArray.push(jetpack)
  saveArray.push(gun)
  saveArray.push(trophy)
  saveArray.push(dave.x)
  saveArray.push(dave.y)
  saveArray.push(dave.ix)
  saveArray.push(dave.iy)
  saveArray.push(bullet.renderable)
  saveArray.push(bullet.x)
  saveArray.push(bullet.y)
  saveArray.push(bullet.iy)
  saveArray.push(bulletTimeout)
  saveArray.push(enemyPosition)
  saveArray.push(enemyTimer)
  saveArray.push(enemies.length)
  for (var i =0; i<enemies.length; i++) {
    saveArray.push(enemies[i].x)
    saveArray.push(enemies[i].y)
    saveArray.push(enemies[i].ix)
    saveArray.push(enemies[i].renderable)
    saveArray.push(enemyShotTimers[i])
    saveArray.push(enemyShots[i].x)
    saveArray.push(enemyShots[i].y)
    saveArray.push(enemyShots[i].ix)
    saveArray.push(enemyShots[i].iy)
    saveArray.push(enemyShots[i].renderable)
  }
  saveArray.push(explosions.length)
  for (var i =0; i<explosions.length; i++) {
    saveArray.push(explosions[i].x)
    saveArray.push(explosions[i].y)
    saveArray.push(explosions[i].ix)
    saveArray.push(explosions[i].state)
  }
  window.localStorage.setItem("dave-save",saveArray.join(","))
  pause=false
  inWarp=false
  usedWarp=false
  loadLevel(0)
  daveScreen=SCREEN_TITLE
  setMusic("title")
  menuFrame=0
  frame=0
  camera=0
  Keys[K_UP] = false
  Keys[K_DOWN] = false
  Keys[K_LEFT] = false
  Keys[K_RIGHT] = false
  Keys[K_RET] = false
  KeysReR[K_UP] = false
  KeysReR[K_DOWN] = false
  KeysReR[K_LEFT] = false
  KeysReR[K_RIGHT] = false
  KeysReR[K_RET] = false
  return
}

function resumeGame() {
  if (!window.localStorage.getItem("dave-save")) {
    return
  }
  saveArray = window.localStorage.getItem("dave-save").split(",")
  frame = parseInt(saveArray.shift())
  subFrame = parseInt(saveArray.shift())
  levelTiles = []
  for (var y = 0; y<10; y++) {
    levelTiles[y] = []
    for (var x = 0; x<100; x++) {
      levelTiles[y][x] = parseInt(saveArray.shift())
    }
  }
  currentLevel = parseInt(saveArray.shift())
  loadedLevel = parseInt(saveArray.shift())
  inWarp = (saveArray.shift() == "true")
  usedWarp = (saveArray.shift() == "true")
  camera = parseInt(saveArray.shift())
  camMult = parseFloat(saveArray.shift())
  disqualified = (saveArray.shift() == "true")
  score = parseInt(saveArray.shift())
  levelScore = parseInt(saveArray.shift())
  levelTotalScore = parseInt(saveArray.shift())
  scoreIncrements = saveArray.shift().split("+")
  for (var i=0; i<scoreIncrements.length; i++) {
    scoreIncrements[i] = parseInt(scoreIncrements[i])
  }
  levelItems = parseInt(saveArray.shift())
  levelTotalItems = parseInt(saveArray.shift())
  enemyKills = parseInt(saveArray.shift())
  enemyMaxKills = parseInt(saveArray.shift())
  lives = parseInt(saveArray.shift())
  lifeAt = parseInt(saveArray.shift())
  jetpack = parseInt(saveArray.shift())
  gun = (saveArray.shift() == "true")
  trophy = (saveArray.shift() == "true")
  dave.x = parseInt(saveArray.shift())
  dave.y = parseInt(saveArray.shift())
  dave.ix = parseInt(saveArray.shift())
  dave.iy = parseInt(saveArray.shift())
  bullet.renderable = (saveArray.shift() == "true")
  bullet.x = parseInt(saveArray.shift())
  bullet.y = parseInt(saveArray.shift())
  bullet.iy = parseInt(saveArray.shift())
  bulletTimeout = parseInt(saveArray.shift())
  enemyPosition = parseInt(saveArray.shift())
  enemyTimer = parseInt(saveArray.shift())
  enemies = []
  enemyShotTimers = []
  enemyShots = []
  var enemyCount = parseInt(saveArray.shift())
  for (var i=0; i<enemyCount; i++) {
    enemies[i] = new Sprite(parseInt(saveArray.shift()),parseInt(saveArray.shift()),enemyWidths[loadedLevel],enemyHeights[loadedLevel],parseInt(saveArray.shift()),0,enemyWidths[loadedLevel],enemyHeights[loadedLevel],"gfx/"+graphicsSet+"/enemy" + loadedLevel + ".png")
    enemies[i].renderable = (saveArray.shift() == "true")
    enemies[i].hy = Math.floor(enemyHeights[loadedLevel]/2)-8
    enemies[i].hh = enemies[i].hy+16
    enemies[i].hw = 16
    enemyShotTimers[i] = parseInt(saveArray.shift())
    enemyShots[i] = new Sprite(parseInt(saveArray.shift()),parseInt(saveArray.shift()),19,3,parseInt(saveArray.shift()),parseInt(saveArray.shift()),19,3,"gfx/"+graphicsSet+"/flame.png")
    enemyShots[i].renderable = (saveArray.shift() == "true")
    enemyShots[i].hx = 1
    enemyShots[i].hw = 18
  }
  explosions = []
  var explosionCount = parseInt(saveArray.shift())
  for (var i=0; i<explosionCount; i++) {
    explosions[i] = new Sprite(parseInt(saveArray.shift()),parseInt(saveArray.shift()),20,13,parseInt(saveArray.shift()),0,20,13,"gfx/"+graphicsSet+"/explosion.png",true)
    explosions[i].state = (saveArray.shift() == "true")
  }
  startPause = false
  dave.state = DaveStanding
  pause = false
  freezeGame = false
  scrollCounter = 0
  customLevel = false
  inDemo = false
  daveScreen = SCREEN_GAME
  updateHud()
  updateTileCanvas()
  updateMusic()
  window.localStorage.removeItem("dave-save")
}