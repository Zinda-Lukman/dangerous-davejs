// Shop modal with Telegram WebApp integration and a test simulation helper

//import { getTg } from "./purchase"

// Telegram WebApp helper references
//import {getTg, isDemoMode, buyProduct } from "./purchase.js";
var tgWebApp = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null
var simulateTG = false

function initTelegramIntegration() {
  if (tgWebApp) {
    try { if (typeof tgWebApp.ready === 'function') tgWebApp.ready() } catch(e) {}
    // try to read stars from initDataUnsafe if provided by your bot
    try {
      var initUnsafe = tgWebApp.initDataUnsafe || null
      if (initUnsafe && initUnsafe.user && typeof initUnsafe.user.stars !== 'undefined') {
        tgStars = initUnsafe.user.stars
      } else if (initUnsafe && typeof initUnsafe.tgStars !== 'undefined') {
        tgStars = initUnsafe.tgStars
      }
    } catch(e) {}
  }
}

function enableTGSimulation(initialStars) {
  simulateTG = true
  if (!initialStars) initialStars = (typeof tgStars !== 'undefined' ? tgStars : 10)
  if (!window.Telegram) window.Telegram = {}
  window.Telegram.WebApp = {
    initDataUnsafe: { user: { id: 12345, first_name: 'Test', stars: initialStars } },
    ready: function() { console.log('[tg-sim] ready') },
    sendData: function(data) { console.log('[tg-sim] sendData', data) },
    MainButton: { show: function(){}, hide: function(){}, setText: function(){}, onClick: function(){}} 
  }
  tgWebApp = window.Telegram.WebApp
  initTelegramIntegration()
}

// Initialize if real Telegram is present
initTelegramIntegration()

// Utility to style buttons to match game's HUD
function styleShopButton(btn) {
  btn.style.background = '#000'
  btn.style.color = '#fff'
  btn.style.border = '2px solid #fff'
  btn.style.padding = '6px 8px'
  btn.style.cursor = 'pointer'
  btn.style.fontFamily = 'monospace'
  btn.style.fontSize = '14px'
  btn.style.borderRadius = '4px'
}

function createShopModal() {
  if (document.getElementById('tg-shop-modal')) return

  var modal = document.createElement('div')
  modal.id = 'tg-shop-modal'
  modal.style.position = 'fixed'
  modal.style.left = '0'
  modal.style.top = '0'
  modal.style.width = '100%'
  modal.style.height = '100%'
  modal.style.display = 'none'
  modal.style.alignItems = 'center'
  modal.style.justifyContent = 'center'
  modal.style.backgroundColor = 'rgba(0,0,0,0.6)'
  modal.style.zIndex = 9999

  var panel = document.createElement('div')
  panel.style.background = '#000'
  panel.style.padding = '12px'
  panel.style.borderRadius = '6px'
  panel.style.minWidth = '280px'
  panel.style.maxWidth = '90%'
  panel.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)'
  panel.style.color = '#fff'
  panel.style.fontFamily = 'monospace'
  panel.style.textAlign = 'center'
  panel.style.border = '8px solid transparent'
  panel.style.borderImageSource = 'url(gfx/vga/help-border.png)'
  panel.style.borderImageSlice = '25%'
  panel.style.borderImageRepeat = 'repeat'

  var title = document.createElement('div')
  title.innerText = 'Buy Lives'
  title.style.fontSize = '18px'
  title.style.marginBottom = '8px'
  panel.appendChild(title)

  var balance = document.createElement('div')
  balance.id = 'tg-shop-balance'
  balance.style.marginBottom = '8px'
  panel.appendChild(balance)

  var options = document.createElement('div')
  options.style.display = 'flex'
  options.style.gap = '8px'
  options.style.marginBottom = '8px'

  function makeOption(n) {
    var btn = document.createElement('button')
    btn.innerText = n + ' life(s) - ' + (n*lifePrice) + ' ★'
    btn.style.flex = '1'
    styleShopButton(btn)
    btn.onclick = function() { purchaseLives(n) }
    return btn
  }

  options.appendChild(makeOption(1))
  options.appendChild(makeOption(2))
  options.appendChild(makeOption(3))
  panel.appendChild(options)
/** 
  var customWrap = document.createElement('div')
  customWrap.style.display = 'flex'
  customWrap.style.gap = '8px'
  customWrap.style.marginBottom = '8px'

  var customInput = document.createElement('input')
  customInput.type = 'number'
  customInput.min = '1'
  customInput.value = '1'
  customInput.style.flex = '1'
  customInput.id = 'tg-shop-custom-input'
  customInput.style.padding = '6px'
  customInput.style.fontFamily = 'monospace'

  var customBtn = document.createElement('button')
  customBtn.innerText = 'Buy'
  styleShopButton(customBtn)
  customBtn.onclick = function() {
    var n = parseInt(customInput.value,10) || 0
    if (n>0) purchaseLives(n)
  }

  customWrap.appendChild(customInput)
  customWrap.appendChild(customBtn)
  panel.appendChild(customWrap)
**/
  var msg = document.createElement('div')
  msg.id = 'tg-shop-msg'
  msg.style.minHeight = '18px'
  msg.style.marginBottom = '8px'
  panel.appendChild(msg)

  var footer = document.createElement('div')
  footer.style.display = 'flex'
  footer.style.justifyContent = 'space-between'

  var cancel = document.createElement('button')
  cancel.innerText = 'No thanks'
  styleShopButton(cancel)
  cancel.onclick = function() { hideShopModal(false) }

  footer.appendChild(cancel)
  panel.appendChild(footer)

  modal.appendChild(panel)
  document.body.appendChild(modal)
}

function updateShopBalance() {
  var b = document.getElementById('tg-shop-balance')
  if (!b) return
  if(isDemoMode(getUserId())){
  b.innerText = 'Stars: ' + (typeof tgStars !== 'undefined' ? tgStars : 0)
  } else {
    b.innerText = "Check YOUR Telegram APP"
  }
}

function showShopModal() {
  createShopModal()
  updateShopBalance()
  var m = document.getElementById('tg-shop-modal')
  if (!m) return
  // Temporarily suppress the HUD game-over display by restoring lives to 0 while modal is active
  if (typeof lives !== 'undefined' && lives < 0) {
    window._shopPrevLives = lives
    lives = 0
    //try { updateHud() } catch(e){}
  }
  // mark that modal was shown for this death to avoid repetition during the same event
  shopShown = true
  m.style.display = 'flex'
  freezeGame = true
}

function hideShopModal(resume) {
  var m = document.getElementById('tg-shop-modal')
  if (!m) return
  m.style.display = 'none'
  freezeGame = false
  if (!resume) {
    // user declined -> proceed to game over and mark as offered
    shopShown = true
    lives = -1
    try { setMusic("gameover") } catch(e) {}
    //updateHud()
  } else {
    // resume after purchase: allow future shop offers when player dies again
    shopShown = false
    try { updateHud() } catch(e) {}
  }
}

async function purchaseLives(n) {
  var cost = n * lifePrice
  var msg = document.getElementById('tg-shop-msg')
  // perform purchase: deduct stars and add lives
  if (isDemoMode(getUserId())){
      showToast("In Demo mode")
      if (typeof tgStars === 'undefined') tgStars = 1000
      if (tgStars < cost) {
        showToast('Not enough Demo stars to buy lives.')
        return
      }
      tgStars -= cost
  } else {
      try {
        var success = false
        var cancelledByUser = false
        var attempts = 0
        while(!success){
            var result = await buyProduct("dangerous_dave_lives", cost, getUserId(), n);
            success = Array.isArray(result) ? !!result[0] : !!result
            cancelledByUser = Array.isArray(result) ? !!result[1] : false
            if (success){
              break
            } else if (cancelledByUser){
              return
            } else {
              if( attempts < 3){
                  showToast('Purchase failed. Please trying again...');
                  attempts++
              } else {
                  showToast('Buying New Lives Failed, Sorry but, Game Over.')
                  return
              }
            }
        }
      } catch(e){
        showToast(`Lives Purchase Errored: ${e}`);
        console.error("[Lives purchase] failed", e);
        return
      }
  }
  lives += n

  if (msg) msg.innerText = 'Purchase successful! +' + n + ' life(s)'
  updateShopBalance()
  setTimeout(function() {
    if (msg) msg.innerText = ""
    hideShopModal(true)
    //updateHud()
  }, 600)
  }

// expose for console/testing
window.showShopModal = showShopModal
window.hideShopModal = hideShopModal
window.purchaseLives = purchaseLives
window.enableTGSimulation = enableTGSimulation

// --- Saved levels support (local + Telegram-aware purchases) ---
var baseSaveCost = 5 // base stars cost for level 1; doubles each level
function getSaveCost(level) {
  if (!level || level < 1) level = 1
  return baseSaveCost * Math.pow(2, Math.max(0, level-1))
}

function normalizeSavedLevels(input) {
  var result = []
  if (!input) return result
  if (typeof input === 'string') {
    try { input = JSON.parse(input) } catch(e) { return result }
  }
  if (!Array.isArray(input)) return result
  for (var i = 0; i < input.length; i++) {
    var item = input[i]
    if (!item || typeof item !== 'object') continue
    var lvl = parseInt(item.level, 10)
    if (!isNaN(lvl) && lvl > 0) {
      result.push({ level: lvl, at: item.at || Date.now() })
    }
  }
  return result.filter(function(value, index, arr) {
    return arr.findIndex(function(candidate) { return candidate.level == value.level }) === index
  })
}


function createSavedLevelsButton() {
  var wrap = document.getElementById('cheatButtons')
  if (!wrap) return
  if (document.getElementById('saved-levels-btn')) return
  var btn = document.createElement('button')
  btn.id = 'saved-levels-btn'
  btn.innerText = 'Saved Levels'
  styleShopButton(btn)
  btn.style.marginLeft = '8px'
  btn.onclick = function(){ showSavedLevelsModal() }
  btn.style.display = 'none'
  wrap.appendChild(btn)
}

function updateSavedLevelsButton() {
  createSavedLevelsButton()
  var btn = document.getElementById('saved-levels-btn')
  if (!btn) return
  // only show on title screen
  try {
    btn.style.display = (typeof daveScreen !== 'undefined' && daveScreen == SCREEN_TITLE) ? 'inline-block' : 'none'
  } catch(e) { btn.style.display = 'none' }
}

function createSavedLevelsModal() {
  if (document.getElementById('saved-levels-modal')) return
  var modal = document.createElement('div')
  modal.id = 'saved-levels-modal'
  modal.style.position = 'fixed'
  modal.style.left = '0'
  modal.style.top = '0'
  modal.style.width = '100%'
  modal.style.height = '100%'
  modal.style.display = 'none'
  modal.style.alignItems = 'center'
  modal.style.justifyContent = 'center'
  modal.style.backgroundColor = 'rgba(0,0,0,0.6)'
  modal.style.zIndex = 9999

  var panel = document.createElement('div')
  panel.style.background = '#000'
  panel.style.padding = '12px'
  panel.style.borderRadius = '6px'
  panel.style.minWidth = '280px'
  panel.style.maxWidth = '90%'
  panel.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)'
  panel.style.color = '#fff'
  panel.style.fontFamily = 'monospace'
  panel.style.textAlign = 'center'
  panel.style.border = '8px solid transparent'
  panel.style.borderImageSource = 'url(gfx/vga/help-border.png)'
  panel.style.borderImageSlice = '25%'
  panel.style.borderImageRepeat = 'repeat'

  var title = document.createElement('div')
  title.innerText = 'Saved Levels'
  title.style.fontSize = '18px'
  title.style.marginBottom = '8px'
  panel.appendChild(title)

  var list = document.createElement('div')
  list.id = 'saved-levels-list'
  list.style.minHeight = '24px'
  list.style.marginBottom = '8px'
  panel.appendChild(list)

  var footer = document.createElement('div')
  footer.style.display = 'flex'
  footer.style.justifyContent = 'space-between'

  var close = document.createElement('button')
  close.innerText = 'Close'
  styleShopButton(close)
  close.onclick = function(){ modal.style.display='none'; freezeGame=false }
  footer.appendChild(close)

  panel.appendChild(footer)
  modal.appendChild(panel)
  document.body.appendChild(modal)
}

async function renderSavedLevelsList() {
  createSavedLevelsModal()
  var list = document.getElementById('saved-levels-list')
  if (!list) return
  list.innerHTML = ''
  var arr = await getSavedLevels()
  if (!arr || arr.length == 0) {
    list.innerText = 'No saved levels.'
    return
  }
  arr.sort(function(a,b){return a.level-b.level})
  arr.forEach(function(item){
    var row = document.createElement('div')
    row.style.display='flex'
    row.style.justifyContent='space-between'
    row.style.alignItems='center'
    row.style.marginBottom='6px'
    var label = document.createElement('div')
    label.innerText = 'Level ' + item.level + ' (start next: ' + (item.level+1) + ')'
    row.appendChild(label)
    var btns = document.createElement('div')
    var start = document.createElement('button')
    start.innerText = 'Start'
    styleShopButton(start)
    start.onclick = function(){
      var next = item.level+1
      if (next > 11) { showToast('No next level available'); return }
      try {
        freezeGame = false
        document.getElementById('saved-levels-modal').style.display='none'
        currentLevel = next
        lives = 3
        daveScreen = SCREEN_GAME
        invincible = false
        updateHud()
        loadLevel(currentLevel)
        setMusic('level'+currentLevel)
      } catch(e){ console.log(e) }
    }
    btns.appendChild(start)
    var del = document.createElement('button')
    del.innerText = 'Delete'
    styleShopButton(del)
    del.onclick = function(){ removeSavedLevel(item.level); renderSavedLevelsList() }
    btns.appendChild(del)
    row.appendChild(btns)
    list.appendChild(row)
  })
}

function showSavedLevelsModal() {
  createSavedLevelsModal()
  renderSavedLevelsList()
  var m = document.getElementById('saved-levels-modal')
  if (!m) return
  m.style.display = 'flex'
  freezeGame = true
}

// Save prompt shown after finishing a level
function createSavePromptModal() {
  if (document.getElementById('save-prompt-modal')) return

  var modal = document.createElement('div')
  modal.id = 'save-prompt-modal'
  modal.style.position = 'fixed'
  modal.style.left = '0'
  modal.style.top = '0'
  modal.style.width = '100%'
  modal.style.height = '100%'
  modal.style.display = 'none'
  modal.style.alignItems = 'center'
  modal.style.justifyContent = 'center'
  modal.style.backgroundColor = 'rgba(0,0,0,0.6)'
  modal.style.zIndex = 9999

  var panel = document.createElement('div')
  panel.style.background = '#000'
  panel.style.padding = '12px'
  panel.style.borderRadius = '6px'
  panel.style.minWidth = '280px'
  panel.style.maxWidth = '90%'
  panel.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)'
  panel.style.color = '#fff'
  panel.style.fontFamily = 'monospace'
  panel.style.textAlign = 'center'
  panel.style.border = '8px solid transparent'
  panel.style.borderImageSource = 'url(gfx/vga/help-border.png)'
  panel.style.borderImageSlice = '25%'
  panel.style.borderImageRepeat = 'repeat'

  var title = document.createElement('div')
  title.id = 'save-prompt-title'
  title.innerText = 'Save completed level?'
  title.style.fontSize = '18px'
  title.style.marginBottom = '8px'
  panel.appendChild(title)

  var msg = document.createElement('div')
  msg.id = 'save-prompt-msg'
  msg.style.minHeight = '24px'
  msg.style.marginBottom = '8px'
  panel.appendChild(msg)

  var footer = document.createElement('div')
  footer.style.display = 'flex'
  footer.style.justifyContent = 'space-between'

  var no = document.createElement('button')
  no.innerText = 'No'
  styleShopButton(no)
  no.onclick = function(){ modal.style.display='none'; freezeGame=false }
  footer.appendChild(no)

  var yes = document.createElement('button')
  yes.id = 'save-prompt-yes'
  yes.innerText = 'Save'
  styleShopButton(yes)
  footer.appendChild(yes)

  panel.appendChild(footer)
  modal.appendChild(panel)
  document.body.appendChild(modal)
}

function removeSavePromptUnfreeze(m){
    m.style.display = 'none'
    freezeGame = false
}

function getTelegramWebApp() {
  try {
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      tgWebApp = window.Telegram.WebApp
    }
  } catch (e) {}
  return (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) || tgWebApp || null
}

function getTelegramUserId() {
  var tg = getTelegramWebApp()
  if (!tg) return null

  try {
    var initUnsafe = tg.initDataUnsafe || (window.Telegram && window.Telegram.initDataUnsafe) || null
    var user = initUnsafe && initUnsafe.user ? initUnsafe.user : null
    if (user && (user.id !== undefined && user.id !== null && user.id !== '')) return String(user.id)
    if (user && user.id_str) return String(user.id_str)
  } catch (e) {}

  try {
    var initData = tg.initData || (window.Telegram && window.Telegram.initData) || ''
    if (typeof initData === 'string' && initData.indexOf('user=') !== -1) {
      var match = initData.match(/(?:^|[?&])user=([^&]+)/)
      if (match && match[1]) {
        var decoded = decodeURIComponent(match[1].replace(/\+/g, ' '))
        var parsed = JSON.parse(decoded)
        if (parsed && (parsed.id !== undefined && parsed.id !== null && parsed.id !== '')) return String(parsed.id)
        if (parsed && parsed.id_str) return String(parsed.id_str)
      }
    }
  } catch (e) {}

  return null
}

function getUserId(){
  var tgUser = getTelegramUserId()
  if (tgUser !== null && tgUser !== undefined && tgUser !== '' && String(tgUser) !== 'undefined') {
    return 'tg_' + String(tgUser)
  }

  var userId = "anon_undefined"
  try {
    userId = localStorage.getItem('Dangerous_Dave_user_id')
    if (!userId) {
      userId = 'anon_' + Date.now()
      localStorage.setItem('Dangerous_Dave_user_id', userId)
    }
  } catch (e) {
    userId = 'anon_' + Date.now()
  }
  return userId
}

function showSavePrompt(level) {
  if (!level) return
  createSavePromptModal()
  var m = document.getElementById('save-prompt-modal')
  var msg = document.getElementById('save-prompt-msg')
  var yes = document.getElementById('save-prompt-yes')
  if (!m || !msg || !yes) return
  var cost = getSaveCost(level)
  msg.innerText = 'Save level ' + level + ' for ' + cost + ' ★?'
  m.style.display = 'flex'
  freezeGame = true

  yes.onclick = async function() {
    if (isDemoMode(getUserId())){
      if (typeof tgStars === 'undefined') tgStars = 1000
      if (tgStars < cost) {
        removeSavePromptUnfreeze(m)
        showToast('Not enough Demo stars to save this level.')
        return
      }
      tgStars -= cost
    } else {
      try {
        var success = false
        var cancelledByUser = false
        var attempts = 0
        while(!success){
            var result = await buyProduct("dangerous_dave_saves", cost, getUserId(), 1);
            success = Array.isArray(result) ? !!result[0] : !!result
            cancelledByUser = Array.isArray(result) ? !!result[1] : false
            if (success){
              break
            } else if (cancelledByUser){
              removeSavePromptUnfreeze(m)
              return
            } else {
              if( attempts < 1){
                  showToast('Purchase failed. Please trying again.');
                  attempts++
              } else {
                  removeSavePromptUnfreeze(m)
                  showToast('Saving Failed, continue with Game')
                  return
              }
            }
        }
      } catch(e){
        removeSavePromptUnfreeze(m)
        showToast(`Saves Purchase Errored: ${e}`);
        console.error("[Saves purchase] failed", e);
        return
      }
    }
    addSavedLevel(level)
    updateShopBalance()
    removeSavePromptUnfreeze(m)
    showToast('Level saved.')
  }
}

// periodically update button visibility and watch for end-level events to prompt saving
setTimeout(function(){
  createSavedLevelsButton(); createSavedLevelsModal(); createSavePromptModal();
  //loadUserProgressFromDatabase().catch(function() {})
},1000)
setInterval(function(){ try { updateSavedLevelsButton() } catch(e){} },250)
// watch for end-level screen and show prompt once per completion
setInterval(async function(){
  try {
    if (typeof daveScreen === 'undefined') return
    
    if (daveScreen == SCREEN_END_LEVEL && window.lastCompletedLevel && !window._savePromptShownForLevel) {
      // only offer saving for normal non-custom, non-warp levels
      window._savePromptShownForLevel = true
      if (typeof customLevel !== 'undefined' && customLevel) return
      var lvl = window.lastCompletedLevel
      var arr = await getSavedLevels()
      for (var i=0;i<arr.length;i++) if (arr[i].level == lvl) return
      if (typeof customLevel !== 'undefined' && customLevel) return
      // show prompt for levels that are within range
      if (lvl >= 1 && lvl <= 10) {
        //window._savePromptShownForLevel = true
        clearMovementKeys()
        showSavePrompt(lvl)
      }
    }
    if (daveScreen != SCREEN_END_LEVEL && window._savePromptShownForLevel) {
      // clear lastCompletedLevel when leaving end screen
      // but keep record to avoid re-prompting
      window._savePromptShownForLevel = false
    }
  } catch(e) { }
},500)

// expose functions for debugging

window.showSavedLevelsModal = showSavedLevelsModal
window.showSavePrompt = showSavePrompt
