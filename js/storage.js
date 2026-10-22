function localKey(userId) {
  return `D_dave_${userId}`;
}

function safeLocalStorageGet(key, fallback) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    var value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

function safeParseJson(value, fallback) {
  if (value === null || typeof value === 'undefined' || value === '') return fallback;
  try {
    return JSON.parse(value)
  } catch (e) {
    return fallback
  }
}

function getLocalUserProfile() {
  try {
    var raw = safeLocalStorageGet(localKey(getUserId()), null)
    var profile = { highest_level: 0, saved_levels: [], highest_score: 0 }
    if (!raw) return profile
    var parsed = safeParseJson(raw, null)
    if (!parsed || typeof parsed !== 'object') return profile
    profile.highest_level = parseInt(parsed.highest_level || parsed.highestLevel || 0, 10) || 0
    profile.saved_levels = normalizeSavedLevels(parsed.saved_levels || parsed.savedLevels || [])
    profile.highest_score = parseInt(parsed.highest_score || parsed.highestScore || 0, 10) || 0
    return profile
  } catch(e) { return { highest_level: 0, saved_levels: [], highest_score: 0  } }
}

function setLocalUserProfile(profile) {
  try {
    var next = {
      highest_level: parseInt(profile && profile.highest_level || 0, 10) || 0,
      saved_levels: normalizeSavedLevels(profile && profile.saved_levels || []),
      highest_score: parseInt(profile && profile.highest_score || 0, 10)
    }
    safeLocalStorageSet(localKey(getUserId()), JSON.stringify(next))
    return next
  } catch(e) { return { highest_level: 0, saved_levels: [], highest_score: 0 } }
}

function getSavedLevelsSync() {
  try {
    var s = safeLocalStorageGet('dave-saved-levels_' + localKey(getUserId()), null)
    if (!s) {
      var profile = getLocalUserProfile()
      return profile.saved_levels || []
    }
    return normalizeSavedLevels(safeParseJson(s, []))
  } catch(e) {
    return getLocalUserProfile().saved_levels || []
  }
}

async function getSavedLevels() {
  return getSavedLevelsSync()
}

function setSavedLevels(arr) {
  var next = normalizeSavedLevels(arr)
  safeLocalStorageSet('dave-saved-levels_' + localKey(getUserId()), JSON.stringify(next))
  var profile = getLocalUserProfile()
  profile.saved_levels = next
  setLocalUserProfile(profile)
  return next
}



function updateStoredHighestLevel(level) {
  var current = getLocalUserProfile()
  var nextHighest = Math.max(current.highest_level || 0, parseInt(level, 10) || 0)
  if (nextHighest > (current.highest_level || 0)) {
    current.highest_level = nextHighest
    setLocalUserProfile(current)
  }
  return current
}

function updateStoredHighestScore(_score) {
  var current = getLocalUserProfile()
  var changed = false
  var nextHighest = Math.max(current.highest_score || 0, parseInt(_score, 10) || 0)
  if (nextHighest > (current.highest_score || 0)) {
    current.highest_score = nextHighest
    changed = true
  }
  return [current, changed]
}

const config = {
  provider: 'server', // null, 'supabase' (client), or 'server' (proxy to server)
  supabaseUrl: '',
  supabaseKey: '',
  serverUrl: (() => {
    const baseUrl = (typeof window !== 'undefined' && window.APP_CONFIG && (window.APP_CONFIG.apiBaseUrl || window.APP_CONFIG.serverUrl)) || '';
    return baseUrl ? `${String(baseUrl).replace(/\/+$/, '')}/api/storage` : '/api/storage';
  })()
};

function getRequestHeaders(extra = {}) {
  const headers = {
    Accept: 'application/json',
    ...extra
  };

  const clientApiKey = typeof window !== 'undefined'
    ? (window.CLIENT_API_KEY || window.APP_CONFIG?.clientApiKey || window.__APP_CONFIG__?.clientApiKey)
    : '';

  if (clientApiKey) {
    headers['X-API-Key'] = clientApiKey;
  }

  return headers;
}

function resolveStorageBaseUrl() {
  const configuredFromApp = (typeof window !== 'undefined' && window.APP_CONFIG && (window.APP_CONFIG.apiBaseUrl || window.APP_CONFIG.serverUrl)) || '';
  const configured = (configuredFromApp ? `${String(configuredFromApp).replace(/\/+$/, '')}/api/storage` : (config.serverUrl || '').trim());

  if (typeof window !== 'undefined' && (window.location.port === '5500' || window.location.port === '5501')) {
    return ['http://127.0.0.1:8787/api/storage', true];
  }

  if (configured && configured !== '/api/storage') {
    return [configured.replace(/\/+$/, ''), false];
  }

  return [(configured || '/api/storage').replace(/\/+$/, ''), false];
}

function configureStorage(cfg = {}) {
  Object.assign(config, cfg);
}

async function setServerConfig({ url }) {
  config.provider = 'server';
  config.serverUrl = url || '/api/storage';
}

function useLocalStorageOnly(userId) {
  return !userId /**|| isDemoMode(userId)*/ || !config.provider;
}

async function mergeResults(results) {
  var merged = getLocalUserProfile()
  merged.highest_level = Math.max(merged.highest_level || 0, parseInt((results && results.highest_level) || (results && results.highestLevel) || 0, 10) || 0)
  var remoteSavedLevels = results && results.saved_levels
  if (Array.isArray(remoteSavedLevels)) {
    merged.saved_levels = normalizeSavedLevels(remoteSavedLevels)
  } else if (typeof remoteSavedLevels === 'string') {
    merged.saved_levels = normalizeSavedLevels(safeParseJson(remoteSavedLevels, []))
  } else {
    merged.saved_levels = normalizeSavedLevels([])
  }
  merged.highest_score = Math.max(merged.highest_score || 0, parseInt((results && results.highest_score) || (results && results.highestScore) || 0, 10) || 0)
  if (merged.saved_levels.length) {
    var localSaved = await getSavedLevels()
    var mergedSaved = localSaved.concat(merged.saved_levels)
    merged.saved_levels = normalizeSavedLevels(mergedSaved)
  }
  setLocalUserProfile(merged)
  setSavedLevels(merged.saved_levels)
  return merged
}
var lds = 0
async function loadUserProgressFromDatabase() {
  if (useLocalStorageOnly(getUserId())) return getLocalUserProfile()
  var userId = getUserId()
  var results = null 
// server-backed proxy
  if (config.provider === 'server') {
    try {
      const [baseUrl, areLocal] = resolveStorageBaseUrl();

      if (areLocal) {
        return getLocalUserProfile(userId);
      }

      const url = `${baseUrl}/user/${encodeURIComponent(localKey(userId))}`;
      const res = await fetch(url, { headers: getRequestHeaders() });
      if (!res.ok){
         return getLocalUserProfile();
      } else {
        const json = await res.json();
        results = json && Object.prototype.hasOwnProperty.call(json, 'data') ? (json.data ?? null) : null;
        lds = lds + 1
        return await mergeResults(results);
      }
    } catch (e) {
      console.warn('Storage.loadUser server proxy failed; using local backup only if available', e);
      return getLocalUserProfile();
    }
  }

  // Supabase simple REST upsert/read (client-side) - requires a `users` table
  try {
    const url = `${config.supabaseUrl}/rest/v1/users?user_id=eq.${encodeURIComponent(localKey(userId))}`;
    const res = await fetch(url, {
      headers: {
        apikey: config.supabaseKey,
        Authorization: `Bearer ${config.supabaseKey}`,
        Accept: 'application/json'
      }
    });
    const rows = await res.json();
    if (rows && rows.length) {
       results = rows[0] ?? null;
       return await mergeResults(results);
    }else{
       return getLocalUserProfile();
    }
  } catch (e) {
    console.warn('Storage.loadUser supabase failed; using local backup only if available', e);
    return readLocalUser(userId);
  }
}

async function persistUserProgress() {
   var profile = getLocalUserProfile()
   if (useLocalStorageOnly(getUserId())) return getLocalUserProfile()
   var userId = getUserId()
   var data = {
        telegram_user_id: userId,
        highest_level: profile.highest_level || 0,
        saved_levels: profile.saved_levels || [],
        highest_score: profile.highest_score || 0,
        updated_at: new Date().toISOString()
    }
  
    if (config.provider === 'server') {
      try {
        const [baseUrl, areLocal] = resolveStorageBaseUrl();
  
        if (areLocal) {
          return profile;
        }
  
        const url = `${baseUrl}/user/${encodeURIComponent(localKey(userId))}`;
        await fetch(url, {
          method: 'POST',
          headers: getRequestHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ data })
        });
        return profile;
      } catch (e) {
        console.warn('Storage.saveUser server proxy failed; kept a local backup for retry', e);
        return profile;
      }
    }
  
    try {
      // Upsert via REST: requires RLS to allow anon key to insert/update or use service role key
      const url = `${config.supabaseUrl}/rest/v1/users`;
      const body = JSON.stringify({ user_id: localKey(userId), data });
      await fetch(url, {
        method: 'POST',
        headers: {
          apikey: config.supabaseKey,
          Authorization: `Bearer ${config.supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body
      });
      return profile;
    } catch (e) {
      console.warn('Storage.saveUser supabase failed; kept a local backup for retry', e);
      return profile;
    }
}

function recordCompletedLevel(level) {
  if (!level) return getLocalUserProfile()
  var [profile, changed] = updateStoredHighestScore(score)
  var nextLevel = parseInt(level, 10) || 0
  if (nextLevel > (profile.highest_level || 0)) {
    changed = true
    profile.highest_level = nextLevel
  }
  if(changed){
    setLocalUserProfile(profile)
    persistUserProgress().catch(function() {})
  }
  return profile
}

function addSavedLevel(level) {
  if (!level) return false
  var arr = getSavedLevelsSync()
  // avoid duplicates
  for (var i=0;i<arr.length;i++) if (arr[i].level == level) return false
  arr.push({ level: level, at: Date.now() })
  setSavedLevels(arr)
  var profile = getLocalUserProfile()
  profile.saved_levels = arr
  setLocalUserProfile(profile)
  persistUserProgress().catch(function() {})
  return true
}

function removeSavedLevel(level) {
  var arr = getSavedLevelsSync()
  arr = arr.filter(function(e){ return e.level != level })
  setSavedLevels(arr)
  var profile = getLocalUserProfile()
  profile.saved_levels = arr
  setLocalUserProfile(profile)
  persistUserProgress().catch(function() {})
}

function recordHighScore(_score){
  var profile = getLocalUserProfile()
  var highestScore = profile.highest_score;
  if(_score > (highestScore || 0)){
    profile.highest_score = _score
    setLocalUserProfile(profile)
    persistUserProgress().catch(function() {})
  }
  return profile
}

window.loadUserProgressFromDatabase = loadUserProgressFromDatabase
window.persistUserProgress = persistUserProgress
window.recordCompletedLevel = recordCompletedLevel
window.removeSavedLevel = removeSavedLevel
window.addSavedLevel= addSavedLevel
window.getSavedLevels = getSavedLevels
window.recordHighScore = recordHighScore

