var canvas
var ctx
var tileCanvas
var tileContext
var hudCanvas
var hudContext
var help
var drawInited = false
var graphicsSet = "vga"
var resX = 2
var resY = 2
const graphicsSets = ["cga","ega","vga"]

function drawText(text,x,y,invert) {
  var iy = invert ? 8 : 0
  for (var i=0; i<text.length; i++) {
    ctx.drawImage(fontGfx, text.charCodeAt(i)*8, iy, 8, 8, x+(i*8), y, 8, 8)
  }
}

function drawTextOnHud(text,x,y,invert) {
  if (invert == undefined) {
    invert = false
  }
  var iy = invert ? 8 : 0
  for (var i=0; i<text.length; i++) {
    hudContext.drawImage(fontGfx, text.charCodeAt(i)*8, iy, 8, 8, x+(i*8), y, 8, 8)
  }
}

function Sprite(x,y,w,h,ix,iy,iw,ih,img,renderable=false) {
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.ix = ix
  this.iy = iy
  this.iw = iw
  this.ih = ih
  this.hx = 0
  this.hy = 0
  this.hw = w
  this.hh = h
  this.img = new Image()
  this.img.src = img
  this.renderable = renderable
  this.vars = new Array()
  this.render = function(offset) {
    if (this.renderable) {
      ctx.drawImage(this.img, this.ix, this.iy, this.iw, this.ih, this.x+offset, this.y+16, this.w, this.h)
    }
  }
  this.state = null
}

var tileGfx = new Image()
tileGfx.src = "gfx/"+graphicsSet+"/tiles.png"
var hudGfx = new Image()
hudGfx.src = "gfx/"+graphicsSet+"/hud.png"
var titleGfx = new Image()
titleGfx.src = "gfx/"+graphicsSet+"/title.png"
var trophyGfx = new Image()
trophyGfx.src = "gfx/"+graphicsSet+"/trophy-hud.png"
var gunGfx = new Image()
gunGfx.src = "gfx/"+graphicsSet+"/gun-hud.png"
var jetpackGfx = new Image()
jetpackGfx.src = "gfx/"+graphicsSet+"/jetpack-hud.png"
var jetMeterGfx = new Image()
jetMeterGfx.src = "gfx/"+graphicsSet+"/jet-meter.png"
var lifeGfx = new Image()
lifeGfx.src = "gfx/"+graphicsSet+"/life.png"
var warpZoneGfx = new Image()
warpZoneGfx.src = "gfx/"+graphicsSet+"/warp-zone.png"
var numberGfx = new Image()
numberGfx.src = "gfx/"+graphicsSet+"/numbers.png"
var fontGfx = new Image()
fontGfx.src = "gfx/"+graphicsSet+"/font.png"
var menuGfx = new Image()
menuGfx.src = "gfx/"+graphicsSet+"/menu.png"
var touchInGame = new Image()
touchInGame.src = "gfx/touchOverlay-InGame.png"
var touchYesNo = new Image()
touchYesNo.src = "gfx/touchOverlay-YesNo.png"
var touchMenu = new Image()
touchMenu.src = "gfx/touchOverlay-Menu.png"
var touchGamepadInGame = new Image()
touchGamepadInGame.src = "gfx/touchOverlay-GamepadInGame.png"
var touchGamepadConfig = new Image()
touchGamepadConfig.src = "gfx/touchOverlay-GamepadConfig.png"
var dummyGfx = new Image()

function initialDraw() {
  canvas = document.getElementById('gamearea')
  help = document.getElementById('help')
  if (canvas.getContext) {
    ctx = canvas.getContext('2d', {alpha: false})
    ctx.textBaseline = "top"
    tileCanvas = document.createElement('canvas')
    tileCanvas.width = 1600
    tileCanvas.height = 160
    tileContext = tileCanvas.getContext('2d', {alpha: false})
    hudCanvas = document.createElement('canvas')
    hudCanvas.width = 320
    hudCanvas.height = 200
    hudContext = hudCanvas.getContext('2d')
    drawInited = true
  }
}

function renderSprites(sprArr,offset) {
  var canv = document.getElementById('gamearea')
  var ct = canv.getContext('2d')
  for (var s = 0; s < sprArr.length; s++) {
    sprArr[s].render(offset)
  }
}

function isWithinCamera(x) {
  return x>=((camera*16)-8) && x<((camera+20)*16)
}

function drawNumber(x,y,n,l) {
  var c=Math.pow(10,(l-1))
  for (var i=0; i<l; i++) {
    hudContext.drawImage(numberGfx, (Math.floor(n/c)%10)*8, 0, 8, 10, x+(i*8), y, 8, 10)
    c /= 10
  }
}

function renderTiles() {
  for (var y=0; y<10; y++) {
    for (var x=0; x<20; x++) {
      var tile=levelTiles[y][x+camera]
      if (animations[tile] > 1) {
        ctx.drawImage(tileGfx, (tile+((Math.floor(frame/8)+y+x)%animations[tile]))*16, 0, 16, 16, x*16, (y+1)*16, 16, 16)
      } else {
        ctx.drawImage(tileGfx, tile*16, 0, 16, 16, x*16, (y+1)*16, 16, 16)
      }
    }
  }
}

function renderTilesFast() {
  for (var y=0; y<10; y++) {
    for (var x=0; x<20; x++) {
      var tile=levelTiles[y][x+camera]
      if (animations[tile] > 1) {
        ctx.drawImage(tileGfx, (tile+((Math.floor(frame/8)+y+x)%animations[tile]))*16, 0, 16, 16, x*16, (y+1)*16, 16, 16)
      }
    }
  }
}

function updateTile(x,y) {
  var tile=levelTiles[y][x]
  if (animations[tile] > 1) {
    tileContext.drawImage(tileGfx, (tile+((Math.floor(frame/8)+y+x)%animations[tile]))*16, 0, 16, 16, x*16, y*16, 16, 16)
  } else {
    tileContext.drawImage(tileGfx, tile*16, 0, 16, 16, x*16, y*16, 16, 16)
  }
}

function updateTileCanvas() {
  for (var y=0; y<10; y++) {
    for (var x=0; x<100; x++) {
      updateTile(x,y)
    }
  }
}

function updateTileCanvasAnim() {
  var endx = camera+20
  for (var y=0; y<10; y++) {
    for (var x=camera; x<endx; x++) {
      var tile=levelTiles[y][x]
      if (animations[tile] > 1) {
        tileContext.drawImage(tileGfx, (tile+((Math.floor(frame/8)+y+x)%animations[tile]))*16, 0, 16, 16, x*16, y*16, 16, 16)
      }
    }
  }
}

function switchGraphics(name) {
  graphicsSet=name
  
  var firstSwitch = false
  
  if (!canvas) {
    firstSwitch = true
    canvas = document.getElementById('gamearea')
    help = document.getElementById('help')
    daveStyle = document.getElementById('daveStyle')
  }

  if (mobile_mode) {
    canvas.style.borderImage = ""
    canvas.style.borderWidth = "0px"
    canvas.style.borderHeight = "0px"
  } else {
    canvas.style.borderImage = "url(gfx/"+name+"/canvas-border.png)"
    canvas.style.borderImageSlice = "25%"
    canvas.style.borderImageRepeat = "repeat"
    canvas.style.borderWidth = "16px"
    canvas.style.borderHeight = "16px"
  }
  help.style.borderImage = "url(gfx/"+name+"/help-border.png)"
  help.style.borderImageSlice = "25%"
  help.style.borderImageRepeat = "repeat"
  help.style.borderWidth = (8*resX)+"px"
  help.style.borderHeight = (8*resX)+"px"
  if (graphicsSet == "nes") {
    help.style.backgroundColor = "#000000"
    help.style.color = "#FCD8A8"
  } else {
    help.style.backgroundColor = "#FFFFFF"
    help.style.color = "#000000"
  }
  var newSheet = ""
  switch (graphicsSet) {
    case "cga":
      newSheet = "a { color: #FF55FF } a:active { color: #55FFFF }"
      break
    case "ega":
      newSheet = "a { color: #0000AA } a:active { color: #FF5555 }"
      break
    case "nes":
      newSheet = "a { color: #5C94FC } a:active { color: #D82800 }"
      break
    default:
      newSheet = "a { color: #0000FF } a:active { color: #FF0000 }"
      break
  }
  document.getElementById("stylesheet").innerText = newSheet

  tileGfx.src =     "gfx/"+name+"/tiles.png"; 
  hudGfx.src =      "gfx/"+name+"/hud.png"
  titleGfx.src =    "gfx/"+name+"/title.png"
  trophyGfx.src =   "gfx/"+name+"/trophy-hud.png"
  gunGfx.src =      "gfx/"+name+"/gun-hud.png"
  jetpackGfx.src =  "gfx/"+name+"/jetpack-hud.png"
  jetMeterGfx.src = "gfx/"+name+"/jet-meter.png"
  lifeGfx.src =     "gfx/"+name+"/life.png"
  warpZoneGfx.src = "gfx/"+name+"/warp-zone.png"
  numberGfx.src =   "gfx/"+name+"/numbers.png"
  fontGfx.src =     "gfx/"+name+"/font.png"
  menuGfx.src =     "gfx/"+name+"/menu.png"

  dave.img.src =      "gfx/"+name+"/dave.png"
  interDave.img.src = "gfx/"+name+"/dave.png"
  bullet.img.src =    "gfx/"+name+"/bullet.png"

  //ensure the explosion and flame graphics are loaded regardless of if
  //there are actually any present, so they can be cached ahead of time.
  var loadGfx1 = new Image()
  loadGfx1.src = "gfx/"+name+"/explosion.png"
  var loadGfx2 = new Image()
  loadGfx2.src = "gfx/"+name+"/flame.png"

  for (var i=0; i<explosions.length; i++) {
    explosions[i].img.src = loadGfx1.src
  }
  for (var i=0; i<enemyShots.length; i++) {
    enemyShots[i].img.src = loadGfx2.src
  }
  for (var i=0; i<enemies.length; i++) {
    enemies[i].img.src = "gfx/"+name+"/enemy"+loadedLevel+".png"
  }

  var now = new Date()
  if (now.getMonth() == 3 && now.getDate() == 1) {
    switchSounds("espeak")
  //} else if (name == "nes") {
    //switchSounds("2a03")
  } else {
    switchSounds("pcspk")
  }

  if (!firstSwitch) {
    updateHud()
    updateTileCanvas()
  }

  menuFrame=0
  graphicsSwitch=true
}

var scrollCounter = 0
var scrollDirection = 0
var camera = 0
var camMult = 0

const WalkAnim=[20,40,20,0]
const StandAnim=20
const ForwardAnim=60
const JumpAnim=80
const ClimbAnim=[100,120,100,140]
const JetAnim=[160,180,200,180]

function setRes(w,h) {
  var newWidth = w
  var newHeight = h
  if (mobile_mode) {
    newWidth = w*(innerHeight/h)
    newHeight = innerHeight
    if (newWidth > innerWidth) {
      newWidth = innerWidth
      newHeight = h*(innerWidth/w)
    }
  }
  canvas.style["width"] = ""+newWidth+"px"
  canvas.style["height"] = ""+newHeight+"px"
  resX = newWidth/320
  resY = newHeight/200
  help.style.borderWidth = (8*resX)+"px"
  help.style.borderHeight = (8*resX)+"px"
}

function updateHud() {
  hudContext.drawImage(hudGfx, 0, 0, 320, 200, 0, 0, 320, 200)
  drawNumber(64,1,score,6)
  drawNumber(176,1,currentLevel,2)
  for (var i=0; i<lives; i++) {
    hudContext.drawImage(lifeGfx, 0, 0, 16, 12, 256+(16*i), 0, 16, 12)
  }
  if (trophy) {
    hudContext.drawImage(trophyGfx, 0, 0, 176, 14, 72, 184, 176, 14)
  }
  if (gun) {
    hudContext.drawImage(gunGfx, 0, 0, 62, 11, 240, 170, 62, 11)
  }
  if (jetpack>0) {
    hudContext.drawImage(jetpackGfx, 0, 0, 201, 12, 0, 170, 201, 12)
    hudContext.drawImage(jetMeterGfx, 0, 0, jetpack*2, 4, 76, 174, jetpack*2, 4)
  }
  if (lives<0) {
    drawTextOnHud("\x01\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x02\x03",0,176)
    drawTextOnHud("\x04               game over              \x05",0,184)
    drawTextOnHud("\x06\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x07\x08",0,192)
  }
}
