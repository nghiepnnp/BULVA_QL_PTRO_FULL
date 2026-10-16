const fs = require("node:fs");
const path = require("node:path");
const { withEasUpdate, UUID } = require("../config/eas-update.cjs");
const file = path.resolve(__dirname, "../app.json");
const app = JSON.parse(fs.readFileSync(file, "utf8"));
const [action, id, ...rest] = process.argv.slice(2);
try {
  if (action === "link") {
    if (
      rest.length ||
      !id ||
      !UUID.test(id) ||
      id === "00000000-0000-0000-0000-000000000000"
    )
      throw new Error("Dùng: pnpm ota:link <PROJECT_UUID_THAT_TU_EXPO>");
    const existing = app.expo.extra?.eas?.projectId;
    if (existing && existing !== id)
      throw new Error(
        "Dự án đã liên kết EAS project khác. Kiểm tra app.json trước khi đổi.",
      );
    app.expo.extra = {
      ...app.expo.extra,
      eas: { ...app.expo.extra?.eas, projectId: id },
    };
    app.expo.updates = { ...app.expo.updates, url: `https://u.expo.dev/${id}` };
    withEasUpdate(app.expo, true);
    fs.writeFileSync(file, JSON.stringify(app, null, 2) + "\n");
    console.log(
      "Đã lưu liên kết local:",
      id,
      "(chưa xác minh quyền truy cập trên Expo).",
    );
  } else if (action === "check") {
    if (id) throw new Error("Lệnh check không nhận tham số.");
    const config = withEasUpdate(app.expo, true);
    if (config.runtimeVersion?.policy !== "appVersion")
      throw new Error(
        "runtimeVersion phải dùng policy appVersion theo quy trình dự án.",
      );
    console.log(
      JSON.stringify(
        {
          projectId: config.extra.eas.projectId,
          url: config.updates.url,
          version: config.version,
          runtimeVersion: config.runtimeVersion,
          checkAutomatically: config.updates.checkAutomatically,
          fallbackToCacheTimeout: config.updates.fallbackToCacheTimeout,
        },
        null,
        2,
      ),
    );
  } else throw new Error("Lệnh hợp lệ: link hoặc check.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
