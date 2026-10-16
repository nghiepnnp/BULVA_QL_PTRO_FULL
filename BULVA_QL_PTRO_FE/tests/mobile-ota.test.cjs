const { test } = require("node:test");
const assert = require("node:assert/strict");
const { withEasUpdate } = require("../apps/mobile/config/eas-update.cjs");
const config = require("../apps/mobile/app.json").expo;
const profiles = require("../apps/mobile/eas.json").build;
const id = "12345678-1234-4234-8234-123456789abc";
test("unlinked local app works with OTA disabled but cannot build remotely", () => {
  const unlinked = { ...config, extra: {} };
  assert.equal(withEasUpdate(unlinked).updates.enabled, false);
  assert.throws(() => withEasUpdate(unlinked, true), /Chưa liên kết/);
});
test("linked config preserves auth plugins and enables only its own update URL", () => {
  const linked = {
    ...config,
    extra: { eas: { projectId: id } },
    updates: { ...config.updates, url: undefined },
  };
  const result = withEasUpdate(linked, true);
  assert.equal(result.updates.url, `https://u.expo.dev/${id}`);
  assert.equal(result.updates.enabled, true);
  assert.deepEqual(result.plugins, config.plugins);
  assert.equal(result.ios.usesAppleSignIn, true);
  assert.deepEqual(result.runtimeVersion, { policy: "appVersion" });
  assert.equal(result.updates.checkAutomatically, "ON_LOAD");
  assert.equal(result.updates.fallbackToCacheTimeout, 0);
});
test("invalid project IDs and cross-project update URLs are rejected", () => {
  for (const projectId of [
    "replace-me",
    "00000000-0000-0000-0000-000000000000",
  ])
    assert.throws(
      () => withEasUpdate({ ...config, extra: { eas: { projectId } } }),
      /không hợp lệ/,
    );
  assert.throws(
    () =>
      withEasUpdate({
        ...config,
        extra: { eas: { projectId: id } },
        updates: { url: "https://u.expo.dev/another-project" },
      }),
    /không khớp/,
  );
});
test("preview and production use distinct channels and matching EAS environments", () => {
  assert.equal(profiles.preview.channel, "preview");
  assert.equal(profiles.preview.environment, "preview");
  assert.equal(profiles.preview.distribution, "internal");
  assert.equal(profiles.production.channel, "production");
  assert.equal(profiles.production.environment, "production");
  const scripts = require("../apps/mobile/package.json").scripts;
  for (const name of ["preview", "production"]) {
    assert.ok(
      scripts[`ota:${name}`].includes(
        `--channel ${name} --environment ${name}`,
      ),
    );
    assert.ok(scripts[`ota:${name}`].startsWith("pnpm ota:check &&"));
  }
});
