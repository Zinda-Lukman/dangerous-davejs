const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const keyPath = path.join(__dirname, '..', 'js', 'key.js');
const touchPath = path.join(__dirname, '..', 'js', 'touch.js');

test('input scripts expose global keyboard and touch bind helpers', () => {
  const focusEvents = [];
  const sandbox = {
    window: {
      addEventListener: () => {},
      setTimeout: () => 0,
      Telegram: {
        WebApp: {
          expand: () => { focusEvents.push('webapp-expand'); },
        },
      },
    },
    document: {
      addEventListener: () => {},
      body: {
        addEventListener: () => {},
        setAttribute: () => {},
        focus: () => { focusEvents.push('body-focus'); },
      },
      documentElement: {
        focus: () => { focusEvents.push('document-focus'); },
      },
    },
    event: undefined,
    console,
    setTimeout: () => 0,
    Date,
    navigator: { maxTouchPoints: 0 },
    canvas: {
      style: {},
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      addEventListener: () => {},
      setAttribute: () => {},
      focus: () => { focusEvents.push('canvas-focus'); },
    },
    screen: {},
    daveScreen: 0,
    freezeGame: false,
    mobile_mode: false,
    touchInputMode: 'swipe',
    inDemo: false,
    last_input_by_gamepad: false,
    idle: 0,
    soundSet: 0,
    cheatDialog: false,
    pause: false,
    help: { style: {} },
    resX: 320,
    resY: 200,
  };

  const vm = require('node:vm');
  const codeKey = fs.readFileSync(keyPath, 'utf8');
  const codeTouch = fs.readFileSync(touchPath, 'utf8');

  vm.runInNewContext(codeKey + '\nthis.attachKeyboardHandlers = attachKeyboardHandlers;', sandbox);
  vm.runInNewContext(codeTouch + '\nthis.attachTouchHandlers = attachTouchHandlers;', sandbox);

  assert.equal(typeof sandbox.attachKeyboardHandlers, 'function');
  assert.equal(typeof sandbox.attachTouchHandlers, 'function');
  assert.equal(focusEvents.includes('canvas-focus'), true);
  assert.equal(focusEvents.includes('webapp-expand'), true);
});

test('keyboard handling supports code-based keys and pointer/touch fallback binding', () => {
  const handlers = new Map();
  const sandbox = {
    window: {
      addEventListener: (type, handler) => { handlers.set(type, handler); },
      setTimeout: () => 0,
      Telegram: { WebApp: { expand: () => {} } },
    },
    document: {
      addEventListener: () => {},
      body: {
        addEventListener: () => {},
        setAttribute: () => {},
        focus: () => {},
      },
      documentElement: { focus: () => {} },
    },
    event: undefined,
    console,
    setTimeout: () => 0,
    Date,
    navigator: { maxTouchPoints: 0 },
    canvas: {
      style: {},
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      addEventListener: () => {},
      setAttribute: () => {},
      focus: () => {},
    },
    SCREEN_GAME: 0,
    SCREEN_KEYBOARD: 1,
    daveScreen: 0,
    freezeGame: false,
    mobile_mode: false,
    touchInputMode: 'swipe',
    inDemo: false,
    last_input_by_gamepad: false,
    idle: 0,
    soundSet: 0,
    cheatDialog: false,
    pause: false,
    help: { style: {} },
    resX: 320,
    resY: 200,
    Keys: undefined,
    keyRedefine: -1,
    globalCheats: [],
    cheats: [[], [], [], [], [''] ],
    cheati: [0, 0, 0, 0, 0],
    hideHelp: () => {},
    openSettings: () => {},
    drawText: () => {},
    activateCheat: () => {},
    switchSounds: () => {},
    exitDemo: () => {},
    gamepad_fully_mapped: false,
  };

  const vm = require('node:vm');
  vm.runInNewContext(fs.readFileSync(keyPath, 'utf8') + '\nthis.attachKeyboardHandlers = attachKeyboardHandlers;', sandbox);
  vm.runInNewContext(fs.readFileSync(touchPath, 'utf8') + '\nthis.attachTouchHandlers = attachTouchHandlers;', sandbox);

  const keyHandler = handlers.get('keydown');
  assert.ok(keyHandler, 'keyboard keydown handler should be registered');
  keyHandler({ code: 'ArrowLeft', which: 0, keyCode: 0, defaultPrevented: false, preventDefault() {} });
  assert.equal(sandbox.Keys[2], true, 'ArrowLeft should map to left movement');

  const pointerBinding = handlers.get('pointerdown');
  assert.ok(pointerBinding, 'pointerdown fallback should be registered for Telegram WebApp');
  pointerBinding({ preventDefault() {} });
  assert.equal(typeof pointerBinding, 'function');
});

test('keyboard focus is preserved for active text inputs', () => {
  let focusCalls = 0;
  const sandbox = {
    window: {
      addEventListener: () => {},
      setTimeout: () => 0,
      Telegram: { WebApp: { expand: () => {} } },
    },
    document: {
      addEventListener: () => {},
      body: {
        addEventListener: () => {},
        setAttribute: () => {},
        focus: () => { focusCalls++; },
      },
      documentElement: { focus: () => { focusCalls++; } },
      activeElement: { tagName: 'INPUT', type: 'text' },
    },
    event: undefined,
    console,
    setTimeout: () => 0,
    Date,
    navigator: { maxTouchPoints: 0 },
    canvas: {
      style: {},
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      addEventListener: () => {},
      setAttribute: () => {},
      focus: () => { focusCalls++; },
    },
    SCREEN_GAME: 0,
    SCREEN_KEYBOARD: 1,
    daveScreen: 0,
    freezeGame: false,
    mobile_mode: false,
    touchInputMode: 'swipe',
    inDemo: false,
    last_input_by_gamepad: false,
    idle: 0,
    soundSet: 0,
    cheatDialog: false,
    pause: false,
    help: { style: {} },
    resX: 320,
    resY: 200,
    Keys: undefined,
    keyRedefine: -1,
    globalCheats: [],
    cheats: [[], [], [], [], [''] ],
    cheati: [0, 0, 0, 0, 0],
    hideHelp: () => {},
    openSettings: () => {},
    drawText: () => {},
    activateCheat: () => {},
    switchSounds: () => {},
    exitDemo: () => {},
    gamepad_fully_mapped: false,
  };

  const vm = require('node:vm');
  vm.runInNewContext(fs.readFileSync(keyPath, 'utf8') + '\nthis.focusGameInputTarget = focusGameInputTarget;', sandbox);
  assert.equal(sandbox.focusGameInputTarget(), false);
  assert.equal(focusCalls, 0, 'active name field should not trigger canvas/body refocus');
});
