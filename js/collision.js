function testCollision(xf1,yf1,xt1,yt1,xf2,yf2,xt2,yt2) { // modified from phaser engine
  if (xt1 <= xf2) {
    return false
  }
  if (yt1 <= yf2) {
    return false
  }
  if (xf1 >= xt2) {
    return false
  }
  if (yf1 >= yt2) {
    return false
  }
  return true
}

function spriteCol(s1,s2) {
  return testCollision(s1.x+s1.hx,s1.y+s1.hy,s1.hw+s1.x,s1.hh+s1.y,s2.x+s2.hx,s2.y+s2.hy,s2.hw+s2.x,s2.hh+s2.y)
}

function spriteColWArea(s1,xf2,yf2,xt2,yt2) {
  return testCollision(s1.x+s1.hx,s1.y+s1.hy,s1.hw+s1.x,s1.hh+s1.y,xf2,yf2,xt2,yt2)
}

function spriteColWArray(s1,s2) {
  for (var i=0;i<s2.length;i++) {
    if (testCollision(s1.x+s1.hx,s1.y+s1.hy,s1.hw+s1.x,s1.hh+s1.y,s2[i].x+s2[i].hx,s2[i].y+s2[i].hy,s2[i].hw+s2[i].x,s2[i].hh+s2[i].y) && s2.renderable) {
      return true
    }
  }
  return false
}