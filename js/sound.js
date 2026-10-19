const AudioContext = window.AudioContext || window.webkitAudioContext
const audioCtx = new AudioContext()
const musicFiles = ['level1','level2','level3','level4','level5','level6','level7','level8','level9','level10','inter','win','title','titlenoloop','scores','gameover','warp']
var music = []
var currentMusic = ""
var soundFormat = ".ogg"
var soundSystem
const SNDSYS_ELEMENT = 1
const SNDSYS_BUFFER = 2
var playExplosion = false
var musicToLoad = 0
var soundLocations = []
soundLocations["pcspk"] = []
soundLocations["pcspk"][".ogg"] = "1t23U9elMrQF6qZGNDQKcYs5Xhoi1dQf6"
soundLocations["pcspk"][".mp3"] = "1tNWCwSatx8FTwFaDdUIZ7SvvnQeYfBXk"
soundLocations["espeak"] = []
soundLocations["espeak"][".ogg"] = "1WClpRw9Y6Za-dWYwtS9DEinE4mLhzuU6"
soundLocations["espeak"][".mp3"] = "16HZefYheP-ZxI83iwwfInW_k-QvQuYRX"

function DDMusic(src,loop,localCopy=false,name="unknown",format=soundFormat) {
  this.name = name
  this.paused = true
  this.loop = loop
  this.loaded = false
  this.loading = false
  this.pendingPlay = false
  this.src = (localCopy ? "[From ZIP]" : src)
  if (soundSystem == SNDSYS_ELEMENT) {
    var thisSound = this
    this.audio = new Audio()
    this.audio.src = src
    this.audio.loop = loop
    this.audio.onended = function() {
      thisSound.paused = true
      thisSound.audio.currentTime = 0
    }
    this.play = function() {
      this.paused = false
      this.audio.play()
    }
    this.pause = function() {
      this.audio.pause()
      this.paused = true
    }
    this.stop = function() {
      this.audio.pause()
      this.audio.currentTime = 0
      this.paused = true
    }
    this.load = function() {
      if (!this.loading && !this.loaded) {
        this.loading = true
        this.audio.load()
        this.loading = false
        this.loaded = true
      }
    }
  } else if (soundSystem == SNDSYS_BUFFER) {
    var thisSound = this
    var request = new XMLHttpRequest()
    this.play = function() {
      if (this.paused) {
        this.load()
        this.source = audioCtx.createBufferSource()
        this.source.loop = this.loop
        if (this.loopStart) {
          this.source.loopStart = this.loopStart
        }
        if (this.loopEnd) {
          this.source.loopEnd = this.loopEnd
        }
        this.source.buffer = this.buffer
        if (this.source.buffer) {
          this.loaded = true
          this.source.connect(audioCtx.destination)
          this.source.onended = event => {
            this.paused = true
          }
          this.pendingPlay = false
          try {
            this.source.start(0)
          }
          catch(err) {
            this.play()
          }
        } else {
          this.pendingPlay = true
        }
        this.paused = this.pendingPlay
      }
    }
    this.pause = function() {}
    this.stop = function() {
      this.paused = true
      if (this.source) {
        this.source.stop(0)
      }
    }
    this.load = function() {
      if (!this.loading && !this.loaded) {
        if (localCopy) {
          var audioData = src
          audioCtx.decodeAudioData(audioData, function(buffer) {
            thisSound.buffer = buffer
            thisSound.loading = false
            thisSound.loaded = true
            if (thisSound.pendingPlay) {
              thisSound.play()
              thisSound.pendingPlay = false
            }
          },
          function(e){ console.log("Error with decoding audio data: " + e.err); })
        } else {
          this.loading = true
          request.open('GET', src, true)
          request.responseType = 'arraybuffer'
          request.onload = function() {
            var audioData = request.response
            audioCtx.decodeAudioData(audioData, function(buffer) {
              thisSound.buffer = buffer
              thisSound.loading = false
              thisSound.loaded = true
              if (thisSound.pendingPlay) {
                thisSound.play()
                thisSound.pendingPlay = false
              }
            },
            function(e){ console.log("Error with decoding audio data" + e.err); })
          }
          request.send()
        }
      }
    }
  } else {
    this.play = function() {}
    this.pause = function() {}
    this.stop = function() {}
    this.load = function() {
      this.loaded = true
    }
  }
}

function DDSound(name,zip) {
  this.play = function() {
    if (!this.buffer) {
      return
    }
    if (this.started) {
      this.source.stop(0)
    }
    if (soundsOn) {
      this.source = audioCtx.createBufferSource()
      this.source.buffer = this.buffer
      this.source.connect(audioCtx.destination)
      this.source.start(0)
      this.started = true
    }
  }
  this.stop = function() {
    if (!this.buffer) {
      return
    }
    if (this.started) {
      this.source.stop(0)
      this.started = false
    }
  }
  if (soundSystem == SNDSYS_BUFFER && zip) {
    var thisSound = this
    var f = zip.file(name)
    if (!f) {
      warnSoundLoad("Missing sound asset '" + name + "' in loaded ZIP package.")
      return
    }
    f.async('arraybuffer').then(function(data) {
      audioCtx.decodeAudioData(data, function(buffer) {
        thisSound.buffer = buffer
        thisSound.source = audioCtx.createBufferSource()
        thisSound.source.buffer = thisSound.buffer
        thisSound.source.connect(audioCtx.destination)
        thisSound.source.start(0,0,0)
      },
      function(e){ console.log("Error with decoding audio data" + e.err); })
    }).catch(function(error) {
      warnSoundLoad("Failed to decode sound asset '" + name + "' from the loaded ZIP package.", error)
    })
  }
}

function NullSound() {
  this.play = function() {
    return
  }
  this.stop = function() {
    return
  }
}

function preloadMusic(name) {
  if (musicToLoad > 0) {
    return
  }
  if (music[name]) {
    music[name].load()
  }
}

function addMusic(name,src,localCopy=false,format=soundFormat) {
  var realname = (name == "titlenoloop" ? "title" : name)
  if (localCopy && music[realname]) {
    console.warn("Attempted to load "+name+" a second time")
    return false
  }
	music[realname] = new DDMusic(src,((name != "inter" || doomMode || chexMode) && name != "gameover" && name != "titlenoloop"),localCopy,realname,format)
  return true
}

function setMusic(name,forcePlay) {
  if ((currentMusic == name && !forcePlay) || ((name == "scores" || name == "gameover") && !music[name])) {
    return
  }
  if (music[currentMusic]) {
    music[currentMusic].stop()
  }
  currentMusic = name
  if (music[name]) {
    music[name].play()
  }
  switch (name) {
    case "title":
      if (!music["title"] || !music["title"].loop) {
        for (var i = 0; i <= 10; i++) {
          preloadMusic("level"+i)
        }
      } else {
        preloadMusic("level1")
      }
      preloadMusic("scores")
      break
    case "scores":
      preloadMusic("title")
      break
    case "inter":
      if (daveScreen == SCREEN_WARP_ZONE) {
        if (music["warp"]) {
          preloadMusic("warp")
        } else {
          preloadMusic("level"+levelWarp[currentLevel])
        }
      } else {
        if (currentLevel == 0 && customLevel) {
          preloadMusic("title")
        } else if (inWarp) {
          preloadMusic("level"+currentLevel)
        } else if (currentLevel == 10) {
          preloadMusic("win")
        } else {
          preloadMusic("level"+(currentLevel+1))
        }
      }
      break
    case "win":
    case "gameover":
      if (music["scores"]) {
        preloadMusic("scores")
      } else {
        preloadMusic("title")
      }
      break
    default:
      preloadMusic("title")
      preloadMusic("inter")
      preloadMusic("gameover")
      break
  }
}

function updateMusic(forcePlay,decrementLoadCounter=false) {
  if (decrementLoadCounter) {
    musicToLoad--
  }
  if (musicToLoad > 0) {
    return
  }
  var scr = (daveScreen < SCREEN_CONTROL_PANEL ? daveScreen : previousScreen)
  if (scr == SCREEN_TITLE || (scr == SCREEN_HIGH_SCORES && !music["scores"]) || (inDemo && music["title"] && music["title"].loop)) {
    setMusic("title",forcePlay)
  } else if (scr == SCREEN_HIGH_SCORES) {
    setMusic("scores",forcePlay)
  } else if (scr == SCREEN_GAME) {
    if (inWarp) {
      if (music["warp"]) {
        setMusic("warp")
      } else {
        setMusic("level"+levelWarp[currentLevel],forcePlay)
      }
    } else {
      setMusic("level"+currentLevel,forcePlay)
    }
  } else if (scr == SCREEN_END_LEVEL || scr == SCREEN_WARP_ZONE) {
    setMusic("inter",forcePlay)
  } else if (scr == SCREEN_WIN) {
    setMusic("win",forcePlay)
  }
}

function defineLevelMusic(listString) {
  if (musicToLoad > 0) {
    return
  }
  if (music[currentMusic]) {
    music[currentMusic].stop()
  }
  music = []
  list = listString.split("\n")
  if (list[0] && list[0].includes('=')) {
     var lastMusic = ""
     for (var i = 0; i < list.length; i++) {
       p = list[i].split('=')
       if (!p[1]) {
         continue
       }
       if (p[0].toLowerCase() == "loopstart") {
         music[lastMusic].loopStart = parseFloat(p[1])
       } else if (p[0].toLowerCase() == "loopend") {
         music[lastMusic].loopEnd = parseFloat(p[1])
       } else {
         lastMusic = p[0]
         addMusic(p[0],p[1].replace(".???",soundFormat))
       }
     }
  } else {
    if (list.length < 10) {
      return
    }
    for (var i = 0; i < 10; i++) {
      addMusic("level"+(i+1),list[i].replace(".???",soundFormat))
    }
    if (list[10]) {
      addMusic("inter",list[10].replace(".???",soundFormat))
    }
    if (list[11]) {
      addMusic("win",list[11].replace(".???",soundFormat))
    }
    if (list[12]) {
      addMusic("title",list[12].replace(".???",soundFormat))
    }
    if (list[13]) {
      addMusic("scores",list[13].replace(".???",soundFormat))
    }
    if (list[14]) {
      addMusic("gameover",list[14].replace(".???",soundFormat))
    }
  }
}

function loadMusicFromZip(sourceZip) {
  if (music[currentMusic]) {
    music[currentMusic].stop()
  }
  music = []
  var reader = new FileReader()
  reader.readAsArrayBuffer(sourceZip)
  reader.addEventListener('load', (event) => {
    var zip = new JSZip()
    zip.loadAsync(event.target.result)
      .then(function(zip) {
        var hasOGG = !!zip.file("level1.ogg")
        var hasMP3 = !!zip.file("level1.mp3")
        var usedFormat
        if (hasOGG && hasMP3) {
          usedFormat = soundFormat
        } else if (hasMP3) {
          usedFormat = '.mp3'
        } else if (hasOGG) {
          usedFormat = '.ogg'
        } else {
          warnSoundLoad("Zip is not a valid music pack.")
          return
        }
        var usedMime = (usedFormat == '.ogg' ? 'audio/ogg' : 'audio/mpeg')
        if (usedFormat) {
          musicToLoad = musicFiles.length
          for (var i = 0; i < musicFiles.length; i++) {
            var f = zip.file(musicFiles[i]+usedFormat)
            if (f) {
              if (soundSystem == SNDSYS_BUFFER) {
                eval("f.async('arraybuffer').then(function(data) {\nif (addMusic('"+musicFiles[i]+"',data,true)) {\nupdateMusic(true,true)\n}\n})")
              } else if (soundSystem == SNDSYS_ELEMENT) {
                eval("f.async('base64').then(function(data) {\nif (addMusic('"+musicFiles[i]+"',\"data:"+usedMime+";base64,\"+data,true)) {\nupdateMusic(true,true)\n}\n})")
              }
            } else {
              musicToLoad--
            }
          }
        }
      })
      .catch(function(error) {
        warnSoundLoad("Music zip file could not be read or is not a valid archive.", error)
      })
  })
  reader.addEventListener('error', function(error) {
    warnSoundLoad("Music zip file could not be read from disk.", error)
  })
}

var bumpSnd = new NullSound()
var explodeSnd  = new NullSound()
var fallSnd  = new NullSound()
var flyingSnd = new NullSound()
var jumpSnd = new NullSound()
var levelDoneSnd = new NullSound()
var owSnd = new NullSound()
var powerUpSnd = new NullSound()
var stepSnd = new NullSound()
var toJetPackSnd = new NullSound()
var treasureSnd = new NullSound()
var trophySnd = new NullSound()

var soundsOn = true
var soundSet = ""
var allowGoogleDriveSoundPack = false

function warnSoundLoad(message, error) {
  console.warn("[sound] " + message, error || "")
}

function switchSounds(newSet) {
  if (newSet == soundSet) {
    return
  }
  if (!allowGoogleDriveSoundPack) {
    warnSoundLoad("Google Drive sound loading is disabled. Set allowGoogleDriveSoundPack = true only for a publicly shared sound ZIP.")
    return
  }
  if (!soundLocations[newSet] || !soundLocations[newSet][soundFormat]) {
    warnSoundLoad("No sound pack is configured for set '" + newSet + "' with format '" + soundFormat + "'.")
    return
  }
  var testSnd = new Audio()
  var check = testSnd.canPlayType("audio/ogg")
  soundSet = newSet
  if (check == "no" || check == "") {
    soundFormat = ".mp3"
  }
  var request = new XMLHttpRequest()
  this.started = false
  request.open('GET', "https://www.googleapis.com/drive/v3/files/"+soundLocations[newSet][soundFormat]+"?key=AIzaSyAg95lSygPZTp90RrJj27EHWdYCe9L9iw8&alt=media", true)
  request.responseType = 'arraybuffer'
  request.onload = function() {
    if (request.status >= 400 || !request.response) {
      warnSoundLoad("Sound pack '" + newSet + "' could not be loaded from Google Drive (HTTP " + request.status + ").")
      return
    }
    try {
      var zip = new JSZip()
      zip.loadAsync(request.response)
        .then(function(zip) {
          bumpSnd = new DDSound("bump"+soundFormat,zip)
          explodeSnd = new DDSound("explode"+soundFormat,zip)
          fallSnd = new DDSound("fall"+soundFormat,zip)
          flyingSnd = new DDSound("flying"+soundFormat,zip)
          jumpSnd = new DDSound("jump"+soundFormat,zip)
          levelDoneSnd = new DDSound("leveldone"+soundFormat,zip)
          owSnd = new DDSound("ow"+soundFormat,zip)
          powerUpSnd = new DDSound("powerup"+soundFormat,zip)
          stepSnd = new DDSound("step"+soundFormat,zip)
          toJetPackSnd = new DDSound("tojetpack"+soundFormat,zip)
          treasureSnd = new DDSound("treasure"+soundFormat,zip)
          trophySnd = new DDSound("trophy"+soundFormat,zip)
        })
        .catch(function(error) {
          warnSoundLoad("Sound pack '" + newSet + "' was not a valid ZIP file. Remote sound assets were skipped.", error)
        })
    } catch (error) {
      warnSoundLoad("Unable to parse sound pack '" + newSet + "'.", error)
    }
  }
  request.onerror = function(error) {
    warnSoundLoad("Google Drive sound request failed for '" + newSet + "'.", error)
  }
  request.onabort = function(error) {
    warnSoundLoad("Google Drive sound request was aborted for '" + newSet + "'.", error)
  }
  request.send()
  
}
