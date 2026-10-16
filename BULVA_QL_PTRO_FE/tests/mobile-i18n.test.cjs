const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "apps/mobile/src/i18n");
const vi = require(path.join(dir, "locales/vi.json"));
const en = require(path.join(dir, "locales/en.json"));
const compiled = ts.transpileModule(
  fs.readFileSync(path.join(dir, "core.ts"), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  },
).outputText;
const core = { exports: {} };
new Function("module", "exports", "require", compiled)(
  core,
  core.exports,
  (name) => require(path.resolve(dir, name)),
);
const {
  translate,
  setTranslationLocale,
  t,
  getIntlLocale,
  formatDate,
  historyValue,
  translateMessage,
} = core.exports;

test("Vietnamese and English have complete matching keys and interpolation parameters", () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(vi).sort());
  const params = (text) =>
    [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();
  for (const key of Object.keys(vi)) {
    assert.match(key, /^[A-Z][A-Z0-9_]*$/, key);
    assert.ok(vi[key].trim(), key);
    assert.ok(en[key].trim(), key);
    assert.deepEqual(
      params(en[key]),
      params(vi[key]),
      `English parameters: ${key}`,
    );
  }
});
test("language switches both directions without restarting and preserves surrounding spacing", () => {
  setTranslationLocale("en");
  assert.equal(t("CAI_DAT"), "Settings");
  assert.equal(translateMessage(" người "), " people ");
  assert.equal(getIntlLocale(), "en-US");
  setTranslationLocale("vi");
  assert.equal(t("CAI_DAT"), "Cài đặt");
  assert.equal(getIntlLocale(), "vi-VN");
});
test("dynamic labels and stored history retain inserted names exactly", () => {
  assert.equal(
    translate("NHAN_PHONG_P0", { p0: "Nguyễn Văn A ($&)" }, "en"),
    "Move-in: Nguyễn Văn A ($&)",
  );
  assert.equal(
    translateMessage("Nhận phòng: Nguyễn Văn A", {}, "en"),
    "Move-in: Nguyễn Văn A",
  );
  assert.equal(
    translateMessage("Sửa tiện ích Điện", {}, "en"),
    "Edit utility Điện",
  );
  assert.equal(
    translateMessage("Phòng chỉ còn 2 chỗ. Bạn đang chọn 3 người.", {}, "en"),
    "This unit has 2 spaces left. You selected 3 people.",
  );
});
test("history translates enums but not free-form names or notes", () => {
  setTranslationLocale("vi");
  assert.equal(historyValue("Trạng thái", "ACTIVE"), "Đang khai thác");
  setTranslationLocale("en");
  assert.equal(historyValue("Loại phòng", "ROOM"), "Room");
  assert.equal(historyValue("Tên phòng", "Nhà"), "Nhà");
  assert.equal(historyValue("Mô tả", "Không có"), "Không có");
  assert.equal(historyValue("Người ở", "Chưa có người"), "Unoccupied");
});
test("date formatting follows the chosen locale without changing a date-only day", () => {
  setTranslationLocale("vi");
  assert.equal(formatDate("2026-10-16"), "16/10/2026");
  setTranslationLocale("en");
  assert.equal(formatDate("2026-10-16"), "10/16/2026");
  assert.equal(formatDate("not-a-date"), "not-a-date");
});
test("all static mobile translation references exist and rendered text has no untranslated Vietnamese", () => {
  const errors = [];
  function walk(folder) {
    for (const e of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, e.name);
      if (e.isDirectory()) {
        if (e.name !== "i18n") walk(file);
        continue;
      }
      if (!/\.tsx?$/.test(file)) continue;
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(file, "utf8"),
        99,
        true,
        file.endsWith("tsx") ? 4 : 3,
      );
      function visit(node) {
        if (
          ts.isCallExpression(node) &&
          node.expression.getText(source) === "t" &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          const key = node.arguments[0].text.trim().replace(/\s+/g, " ");
          if (!/^[A-Z][A-Z0-9_]*$/.test(node.arguments[0].text))
            errors.push(`${file}: nonconstant key ${key}`);
          if (!(key in en)) errors.push(`${file}: missing key ${key}`);
        }
        if (ts.isJsxText(node) && /[À-ỹ]/.test(node.text))
          errors.push(`${file}: raw JSX ${node.text.trim()}`);
        if (
          ts.isJsxAttribute(node) &&
          node.initializer &&
          ts.isStringLiteral(node.initializer) &&
          /[À-ỹ]/.test(node.initializer.text)
        )
          errors.push(`${file}: raw attribute ${node.initializer.text}`);
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  walk(path.join(root, "apps/mobile/src"));
  assert.deepEqual(errors, []);
});

test("English uses singular counts without changing Vietnamese or inserted names", () => {
  assert.equal(translate("SO_LUONG_DON_VI", { p0: 1 }, "en"), "1 unit");
  assert.equal(translate("SO_LUONG_DON_VI", { p0: 0 }, "en"), "0 units");
  assert.equal(translate("SO_LUONG_DON_VI", { p0: 2 }, "en"), "2 units");
  assert.equal(
    translateMessage(" đơn vị tạm ngừng khai thác", { count: 1 }, "en"),
    " unit temporarily unavailable",
  );
  assert.equal(translate("SO_LUONG_NGUOI", { p0: 1 }, "vi"), "1 người");
  assert.equal(translate("NHAN_PHONG_P0", { p0: "1" }, "en"), "Move-in: 1");
  const one = require(path.join(dir, "locales/en-one.json"));
  for (const key of Object.keys(one)) {
    assert.ok(key in en, key);
    assert.deepEqual(
      [...one[key].matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]),
      [...vi[key].matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]),
    );
  }
});

test("constant keys match the requested naming and preserve distinct labels", () => {
  assert.equal(translate("TEN_CUA_BAN", {}, "vi"), "Tên của bạn");
  assert.equal(translate("TEN_CUA_BAN", {}, "en"), "Your name");
  assert.equal(translate("CAI_DAT", {}, "vi"), "Cài đặt");
  assert.equal(translate("CAI_DAT_TIEU_DE", {}, "vi"), "CÀI ĐẶT");
  assert.equal(translate("TIM_KIEM", {}, "vi"), "Tìm kiếm");
  assert.equal(translate("TIM_KIEM_GOI_Y", {}, "vi"), "Tìm kiếm...");
});
test("legacy aliases use constant keys and retain compatible interpolation", () => {
  const aliases = require(path.join(dir, "locales/message-aliases.json"));
  const params = (text) =>
    [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort();
  for (const [key, source] of Object.entries(aliases)) {
    assert.match(key, /^[A-Z][A-Z0-9_]*$/);
    assert.ok(key in vi, key);
    assert.deepEqual(params(source), params(vi[key]), key);
    for (const locale of ["vi", "en"]) {
      assert.equal(
        translateMessage(source, {}, locale),
        translate(key, {}, locale),
      );
    }
  }
  assert.equal(
    translateMessage("Nội dung chưa biết: Nguyễn Văn A", {}, "en"),
    "Nội dung chưa biết: Nguyễn Văn A",
  );
});
