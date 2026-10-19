// Simple touch tutorials: movement, gun, jetpack
window.tutorials = {
  movementShown: false,
  gunShown: false,
  jetpackShown: false,
  showMovement: false,
  showGun: false,
  showJetpack: false,
  timers: { movement: 0, gun: 0, jetpack: 0 },
  init: function() {
    try {
      this.movementShown = !!window.localStorage.getItem('dave-touch-tutorial-movement-shown')
      this.gunShown = !!window.localStorage.getItem('dave-touch-tutorial-gun-shown')
      this.jetpackShown = !!window.localStorage.getItem('dave-touch-tutorial-jetpack-shown')
    } catch (e) {}
    var touch = (typeof isTouchDevice !== 'undefined') ? isTouchDevice : !!('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
    if (touch && !this.movementShown) {
      this.showMovement = true
      this.timers.movement = 360
    }
  },
  triggerGun: function() {
    if (this.gunShown) return
    this.showGun = true
    this.timers.gun = 360
    try { window.localStorage.setItem('dave-touch-tutorial-gun-shown','1') } catch(e) {}
  },
  triggerJetpack: function() {
    if (this.jetpackShown) return
    this.showJetpack = true
    this.timers.jetpack = 420
    try { window.localStorage.setItem('dave-touch-tutorial-jetpack-shown','1') } catch(e) {}
  },
  markMovementShown: function() {
    this.movementShown = true
    this.showMovement = false
    try { window.localStorage.setItem('dave-touch-tutorial-movement-shown','1') } catch(e) {}
  }
}

// Auto-init if script loaded
try { window.tutorials.init() } catch (e) {}
