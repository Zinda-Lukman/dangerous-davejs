const TINFO_NONE = 0
const TINFO_SOLID = 1
const TINFO_DOOR = 2
const TINFO_KILLS = 3
const TINFO_CLIMB = 4
const TINFO_JETPACK = 5
const TINFO_GUN = 6
const TINFO_100P = 100
const TINFO_50P = 50
const TINFO_150P = 150
const TINFO_300P = 300
const TINFO_200P = 200
const TINFO_500P = 500
const TINFO_TROPHY = 1000
const tileinfo = [TINFO_NONE,
                  TINFO_SOLID,
                  TINFO_DOOR,
                  TINFO_SOLID,
                  TINFO_JETPACK,
                  TINFO_SOLID,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_TROPHY,
                  TINFO_TROPHY,
                  TINFO_TROPHY,
                  TINFO_TROPHY,
                  TINFO_TROPHY,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_GUN,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_SOLID,
                  TINFO_SOLID,
                  TINFO_NONE,
                  TINFO_NONE,
                  TINFO_CLIMB,
                  TINFO_CLIMB,
                  TINFO_CLIMB,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_KILLS,
                  TINFO_CLIMB,
                  TINFO_CLIMB,
                  TINFO_CLIMB,
                  TINFO_CLIMB,
                  TINFO_CLIMB,
                  TINFO_CLIMB,
                  TINFO_100P,
                  TINFO_50P,
                  TINFO_150P,
                  TINFO_300P,
                  TINFO_200P,
                  TINFO_500P]
const animations = [1,1,1,1,1,1,4,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
const warpTiles=[0, 0, 0, 0, 0, 5, 0, 0, 17,18,29]

function tileAt(x,y,react) {
  if (y < 0 || y >= 160) {
    return (currentLevel==6 ? TINFO_SOLID : TINFO_NONE)
  }
  var tx = Math.floor(x/16)
  var ty = Math.floor(y/16)
  ret = tileinfo[levelTiles[ty][tx]]
  if (react==undefined) {
    react=true
  }
  if (react) {
    if (ret>4) {
      levelItems++
      levelTiles[ty][tx] = 0
      updateTile(tx,ty)
      if (ret==TINFO_TROPHY && !trophy) {
        trophy = true
        trophySnd.play()
        addScore(1000)
      } else if (ret >= 50) {
        treasureSnd.play()
        addScore(ret)
      } else if (ret==TINFO_GUN) {
        powerUpSnd.play()
        gun = true
      } else if (ret==TINFO_JETPACK) {
        powerUpSnd.play()
        jetpack = 60
      }
      updateHud()
    } else if (ret == TINFO_DOOR && trophy) {
      addScore(2000)
      exitLevel()
      updateHud()
      menuFrame = 0
    } else if (ret == TINFO_KILLS && dave.state != DaveDying) {
      killDave(true)
    }
  }
  return ret
}

function distanceFromSolid(x,y,tx) {
  var d = 0
  var fx = Math.floor(x/16)
  var fy = Math.floor(y/16)
  t = tileinfo[levelTiles[fy][fx]]
  while (t != TINFO_SOLID) {
    d += tx>x ? 1 : -1
    t = tileinfo[levelTiles[fy][fx+d]]
  }
  return Math.abs(d)
}
