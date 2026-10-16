const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function withEasUpdate(config, requireProject = false) {
  const projectId = config.extra?.eas?.projectId;
  if (
    projectId &&
    (!UUID.test(projectId) || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(projectId))
  ) {
    throw new Error(
      "EAS projectId không hợp lệ. Chạy pnpm ota:link <PROJECT_UUID> ở thư mục gốc.",
    );
  }
  if (!projectId) {
    if (requireProject)
      throw new Error("Chưa liên kết EAS project. Xem README_EAS_UPDATE.md.");
    // Local development and Expo Go remain usable before the owner links an EAS project.
    return { ...config, updates: { ...config.updates, enabled: false } };
  }
  const url = `https://u.expo.dev/${projectId}`;
  if (config.updates?.url && config.updates.url !== url) {
    throw new Error(
      "updates.url không khớp extra.eas.projectId. Kiểm tra lại EAS project.",
    );
  }
  return { ...config, updates: { ...config.updates, enabled: true, url } };
}
module.exports = { withEasUpdate, UUID };
