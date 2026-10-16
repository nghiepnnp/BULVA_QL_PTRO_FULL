const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const user = { id: 'test-owner', email: 'owner@example.com', name: 'Test Owner' };

async function setup({ isDemo = true, failRentalWrite = false } = {}) {
  const data = new Map([
    ['rentalos_mock_profile', JSON.stringify(user)],
    ['refresh_token', 'test-session'],
    ['unrelated-app-key', 'keep-me'],
  ]);
  let fail = false;
  const storage = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => {
      await new Promise(resolve => setImmediate(resolve));
      if (fail && key === 'rentalos-demo-rentals-v1') throw new Error('storage unavailable');
      data.set(key, value);
    },
    removeItem: async key => { data.delete(key); },
  };
  const cache = new Map();
  const platform = {
    readStoredValue: storage.getItem,
    writeStoredValue: storage.setItem,
    removeStoredValue: storage.removeItem,
  };
  function load(file) {
    file = path.resolve(root, file);
    if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file,"utf8"));
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    function localRequire(name) {
      if (name === '@react-native-async-storage/async-storage') return storage;
      if (name === '@/services/platform-storage') return platform;
      if (name === '@/services/token-storage') return { clearTokens: () => storage.removeItem('refresh_token') };
      if (name === './settings-config') return { isDemo };
      if (name === '@package/shared') return load('packages/shared/src/mocks/rentals.ts');
      if (name.startsWith('@/')) return load(`apps/mobile/src/${name.slice(2)}.ts`);
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name.endsWith(".json") ? name : `${name}.ts`));
      return require(name);
    }
    new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
    return module.exports;
  }
  const rentals = load('apps/mobile/src/features/rentals/store/rental.store.ts').useRentalStore;
  const preferences = load('apps/mobile/src/features/settings/store/preferences.store.ts').usePreferencesStore;
  await rentals.persist.rehydrate(); await preferences.persist.rehydrate();
  await new Promise(resolve => setImmediate(resolve));
  const account = load('apps/mobile/src/features/settings/services/account-service.ts');
  fail = failRentalWrite;
  return { data, rentals, preferences, account };
}

test('preferences persist theme, notification choices and withdrawal of marketing consent', async () => {
  const { preferences, data } = await setup();
  assert.equal(preferences.getState().notifications.marketing, false);
  preferences.getState().setAppearance('dark');
  preferences.getState().setNotification('rent', false);
  preferences.getState().setNotification('marketing', true);
  preferences.getState().setNotification('marketing', false);
  await new Promise(resolve => setImmediate(resolve));
  const saved = JSON.parse(data.get('rentalos-preferences-v1')).state;
  assert.equal(saved.appearance, 'dark');
  assert.equal(saved.notifications.rent, false);
  assert.equal(saved.notifications.marketing, false);
  await preferences.persist.rehydrate();
  assert.equal(preferences.getState().appearance, 'dark');
});
test('profile changes validate input and persist the updated name', async () => {
  const { account, data } = await setup();
  await assert.rejects(account.updateLocalProfile(user, ' '));
  const updated = await account.updateLocalProfile(user, '  New Owner  ');
  assert.equal(updated.name, 'New Owner');
  assert.deepEqual(JSON.parse(data.get('rentalos_mock_profile')), updated);
});
test('wrong email cannot trigger deletion', async () => {
  const { account, data, rentals } = await setup();
  const count = rentals.getState().residents.length;
  await assert.rejects(account.deleteLocalAccount(user, 'wrong@example.com'));
  assert.ok(data.has('rentalos_mock_profile'));
  assert.equal(rentals.getState().residents.length, count);
});
test('demo deletion never acts on a production account', async () => {
  const { account, data } = await setup({ isDemo: false });
  await assert.rejects(account.deleteLocalAccount(user, user.email));
  await assert.rejects(account.updateLocalProfile(user, 'New Name'));
  assert.ok(data.has('refresh_token'));
});
test('deletion clears all personal data and session; empty data survives rehydration', async () => {
  const { account, data, rentals, preferences } = await setup();
  await account.deleteLocalAccount(user, ' OWNER@example.com ');
  assert.equal(data.has('rentalos_mock_profile'), false);
  assert.equal(data.has('refresh_token'), false);
  assert.equal(data.get('unrelated-app-key'), 'keep-me');
  const saved = JSON.parse(data.get('rentalos-demo-rentals-v1')).state;
  for (const key of ['properties','units','residents','occupancies','unitHistory','utilities']) assert.deepEqual(saved[key], []);
  await rentals.persist.rehydrate(); await preferences.persist.rehydrate();
  assert.deepEqual(rentals.getState().residents, []);
  assert.equal(preferences.getState().notifications.marketing, false);
});
test('failed persistence rejects deletion before removing the account identity', async () => {
  const { account, data } = await setup({ failRentalWrite: true });
  await assert.rejects(account.deleteLocalAccount(user, user.email), /storage unavailable/);
  assert.ok(data.has('rentalos_mock_profile'));
  assert.ok(data.has('refresh_token'));
});
test('a changed session cannot delete the currently stored profile', async () => {
  const { account, data } = await setup();
  data.set('rentalos_mock_profile', JSON.stringify({ ...user, id: 'other-owner' }));
  await assert.rejects(account.deleteLocalAccount(user, user.email));
  assert.ok(data.has('refresh_token'));
});

test('language defaults to Vietnamese and survives storage rehydration', async () => {
  const { preferences, data } = await setup();
  assert.equal(preferences.getState().language, 'vi');
  preferences.getState().setLanguage('en');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(JSON.parse(data.get('rentalos-preferences-v1')).state.language, 'en');
  await preferences.persist.rehydrate();
  assert.equal(preferences.getState().language, 'en');
});
