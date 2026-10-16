const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function setup(options = {}) {
  const env = {
    EXPO_PUBLIC_DEMO_MODE: 'false',
    EXPO_PUBLIC_SOCIAL_AUTH_ENABLED: 'true',
    EXPO_PUBLIC_API_URL: 'https://api.example.com/v1',
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: '123-abcdef.apps.googleusercontent.com',
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: '123-iosclient.apps.googleusercontent.com',
    ...options.env,
  };
  const data = new Map();
  const calls = [];
  const cache = new Map();
  const user = { id: 'verified-provider-user', email: 'user@example.com', name: 'Verified User' };
  const sessionResponse = { accessToken: 'app-access', refreshToken: 'app-refresh', user };
  const apple = {
    AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
    isAvailableAsync: async () => options.appleAvailable !== false,
    signInAsync: async (request) => {
      calls.push(['apple', request]);
      if (options.cancelApple) throw { code: 'ERR_REQUEST_CANCELED' };
      return {
        state: options.badState ? 'wrong' : request.state,
        identityToken: 'apple-id-token',
        authorizationCode: 'apple-code',
        fullName: null,
      };
    },
  };
  const google = {
    GoogleSignin: {
      configure: (config) => calls.push(['configure', config]),
      hasPlayServices: async () => calls.push(['play-services']),
      signIn: async () => {
        calls.push(['google']);
        if (options.wait) await options.wait;
        return options.cancelGoogle
          ? { type: 'cancelled' }
          : { type: 'success', data: { idToken: options.noToken ? null : 'google-id-token' } };
      },
    },
    statusCodes: {
      SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
      PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
    },
  };
  const axios = {
    create: () => ({
      post: async (url, body) => {
        calls.push(['post', url, body]);
        if (options.networkFailure) throw new Error('PRIVATE CREDENTIAL');
        return {
          data: url.endsWith('/challenge')
            ? { challengeId: 'challenge-1', nonce: 'server-random-nonce-for-one-use' }
            : options.invalidResponse
              ? { ...sessionResponse, user: { name: 'unverified' } }
              : sessionResponse,
        };
      },
    }),
  };
  function load(relative) {
    let file = path.resolve(root, relative);
    if (!path.extname(file)) file += '.ts';
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    function resolve(name) {
      if (name === 'react-native') return { Platform: { OS: options.platform ?? 'ios' } };
      if (name === 'expo-constants')
        return {
          __esModule: true,
          default: { executionEnvironment: options.expoGo ? 'storeClient' : 'standalone' },
          ExecutionEnvironment: { StoreClient: 'storeClient' },
        };
      if (name === 'expo-crypto') return { randomUUID: () => 'unique-request-state' };
      if (name === 'expo-apple-authentication') return apple;
      if (name === '@react-native-google-signin/google-signin') return google;
      if (name === 'axios') return axios;
      if (name === '@package/shared') return load('packages/shared/src/schemas/auth.schema.ts');
      if (name === './platform-storage')
        return {
          writeStoredValue: async (key, value) => {
            if (options.storageFailure) throw Error('disk unavailable');
            data.set(key, value);
          },
          readStoredValue: async (key) => data.get(key) ?? null,
          removeStoredValue: async (key) => data.delete(key),
        };
      if (name.startsWith('@/')) return load(`apps/mobile/src/${name.slice(2)}`);
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
      return require(name);
    }
    new Function('module', 'exports', 'require', 'process', code)(module, module.exports, resolve, {
      env,
    });
    return module.exports;
  }
  return {
    calls,
    data,
    user,
    load,
    session: load('apps/mobile/src/features/auth/services/social-session.ts'),
    tokens: load('apps/mobile/src/services/token-storage.ts'),
  };
}

test('placeholder, demo, Expo Go and web configurations never start provider login or persist tokens', async () => {
  for (const options of [
    { env: { EXPO_PUBLIC_SOCIAL_AUTH_ENABLED: 'false' } },
    { env: { EXPO_PUBLIC_DEMO_MODE: 'true' } },
    { expoGo: true },
    { platform: 'web' },
    { env: { EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: 'replace-me.apps.googleusercontent.com' } },
    { env: { EXPO_PUBLIC_API_URL: 'http://example.com' } },
    { env: { EXPO_PUBLIC_GOOGLE_AUTH_PATH: '//other.example.com/auth' } },
  ]) {
    const ctx = setup(options);
    await assert.rejects(ctx.session.signInWithProvider('google'));
    assert.equal(ctx.calls.length, 0);
    assert.equal(ctx.data.size, 0);
  }
});
test('Google exchanges identity token and stores only validated app session tokens', async () => {
  const ctx = setup({ platform: 'android' });
  assert.deepEqual(await ctx.session.signInWithProvider('google'), ctx.user);
  assert.ok(ctx.calls.some((c) => c[0] === 'play-services'));
  const post = ctx.calls.find((c) => c[0] === 'post');
  assert.equal(post[1], 'https://api.example.com/v1/auth/google');
  assert.deepEqual(post[2], { idToken: 'google-id-token' });
  assert.equal(ctx.tokens.getAccessToken(), 'app-access');
  assert.equal(ctx.data.get('refresh_token'), 'app-refresh');
  assert.equal(ctx.data.has('rentalos_mock_profile'), false);
});
test('cancellation and missing credentials never produce an application session', async () => {
  for (const [provider, options] of [
    ['google', { cancelGoogle: true }],
    ['apple', { cancelApple: true }],
  ]) {
    const ctx = setup(options);
    assert.equal(await ctx.session.signInWithProvider(provider), null);
    assert.equal(ctx.data.size, 0);
    assert.equal(ctx.tokens.getAccessToken(), null);
  }
  const ctx = setup({ noToken: true });
  await assert.rejects(ctx.session.signInWithProvider('google'));
  assert.equal(ctx.calls.filter((c) => c[0] === 'post').length, 0);
});
test('Apple binds one-time backend nonce to the request, verifies state, and permits returning users without name', async () => {
  const ctx = setup();
  assert.deepEqual(await ctx.session.signInWithProvider('apple'), ctx.user);
  const request = ctx.calls.find((c) => c[0] === 'apple')[1];
  assert.equal(request.nonce, 'server-random-nonce-for-one-use');
  const exchange = ctx.calls.filter((c) => c[0] === 'post').at(-1)[2];
  assert.deepEqual(exchange, {
    idToken: 'apple-id-token',
    authorizationCode: 'apple-code',
    challengeId: 'challenge-1',
  });
  const bad = setup({ badState: true });
  await assert.rejects(bad.session.signInWithProvider('apple'));
  assert.equal(bad.calls.filter((c) => c[0] === 'post').length, 1);
  assert.equal(bad.data.size, 0);
});
test('unsupported Apple devices fail without exchanging credentials', async () => {
  for (const options of [{ platform: 'android' }, { appleAvailable: false }]) {
    const ctx = setup(options);
    await assert.rejects(ctx.session.signInWithProvider('apple'));
    assert.equal(ctx.calls.filter((c) => c[0] === 'post').length, 0);
    assert.equal(ctx.data.size, 0);
  }
});
test('invalid server response, network error and failed secure storage cannot authenticate', async () => {
  for (const options of [
    { invalidResponse: true },
    { networkFailure: true },
    { storageFailure: true },
  ]) {
    const ctx = setup(options);
    await assert.rejects(ctx.session.signInWithProvider('google'));
    assert.equal(ctx.tokens.getAccessToken(), null);
    assert.equal(ctx.data.size, 0);
    assert.ok(!ctx.session.socialErrorMessage(Error('PRIVATE CREDENTIAL')).includes('PRIVATE'));
  }
});
test('concurrent provider attempts do not open two sign-in dialogs', async () => {
  let release;
  const wait = new Promise((resolve) => {
    release = resolve;
  });
  const ctx = setup({ wait });
  const first = ctx.session.signInWithProvider('google');
  assert.equal(await ctx.session.signInWithProvider('apple'), null);
  release();
  await first;
  assert.equal(ctx.calls.filter((c) => c[0] === 'google').length, 1);
  assert.equal(ctx.calls.filter((c) => c[0] === 'apple').length, 0);
});
