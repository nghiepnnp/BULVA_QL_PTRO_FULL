import vi from "./locales/vi.json";
import en from "./locales/en.json";
import enOne from "./locales/en-one.json";
import messageAliases from "./locales/message-aliases.json";

export type Locale = "vi" | "en";
export type TranslationKey = keyof typeof vi;
export type TranslationValues = Record<
  string,
  string | number | null | undefined
>;
export const supportedLocales: Locale[] = ["vi", "en"];
let currentLocale: Locale = "vi";
export function setTranslationLocale(value: Locale) {
  currentLocale = value === "en" ? "en" : "vi";
}
export function getLocale(): Locale {
  return currentLocale;
}
export function getIntlLocale(): string {
  return currentLocale === "en" ? "en-US" : "vi-VN";
}
const dictionaries: Record<Locale, Record<TranslationKey, string>> = { vi, en };
const singularEnglish: Partial<Record<TranslationKey, string>> = enOne;
const placeholder = /\{\{(\w+)\}\}/g;

/** Interface text uses stable UPPER_SNAKE_CASE keys, checked by TypeScript. */
export function translate(
  key: TranslationKey,
  values: TranslationValues = {},
  locale: Locale = currentLocale,
): string {
  if (!Object.prototype.hasOwnProperty.call(dictionaries[locale], key))
    return key;
  let message = dictionaries[locale][key];
  if (locale === "en" && Number(values.count ?? values.p0) === 1) {
    message = singularEnglish[key] ?? message;
  }
  return message.replace(placeholder, (token, name) =>
    String(values[name] ?? token),
  );
}
export const t = translate;

const normalizeMessage = (value: string) => value.trim().replace(/\s+/g, " ");
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Compatibility only for canonical service errors, schema labels and stored history.
// Keys remain constants; aliases contain old wording that differs from today's Vietnamese copy.
const messageSources = new Map<string, TranslationKey>();
for (const [key, value] of Object.entries(vi))
  messageSources.set(normalizeMessage(value), key as TranslationKey);
for (const [key, value] of Object.entries(messageAliases))
  messageSources.set(normalizeMessage(value), key as TranslationKey);
const templates = [...messageSources.entries()]
  .filter(([source]) => source.includes("{{"))
  .map(([source, key]) => {
    const names: string[] = [];
    let cursor = 0;
    let pattern = "^";
    for (const match of source.matchAll(placeholder)) {
      pattern += escapeRegex(source.slice(cursor, match.index)) + "(.+?)";
      names.push(match[1]);
      cursor = match.index! + match[0].length;
    }
    pattern += escapeRegex(source.slice(cursor)) + "$";
    return {
      key,
      names,
      expression: new RegExp(pattern, "s"),
      specificity: source.replace(placeholder, "").length,
    };
  })
  .sort((a, b) => b.specificity - a.specificity);

/** Do not use for new UI labels or user-entered names/notes. Use t(KEY) for interface text. */
export function translateMessage(
  source: string,
  values: TranslationValues = {},
  locale: Locale = currentLocale,
): string {
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  const normalized = normalizeMessage(source);
  if (!normalized) return source;
  let key = messageSources.get(normalized);
  let params = values;
  if (!key) {
    for (const template of templates) {
      const match = template.expression.exec(normalized);
      if (match) {
        key = template.key;
        params = {
          ...Object.fromEntries(
            template.names.map((name, index) => [name, match[index + 1]]),
          ),
          ...values,
        };
        break;
      }
    }
  }
  return key ? leading + t(key, params, locale) + trailing : source;
}

export function formatDate(value: string, withTime = false): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(
    getIntlLocale(),
    withTime
      ? {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { year: "numeric", month: "2-digit", day: "2-digit" },
  );
}
/** Translate schema-owned values without changing resident names or free-form notes. */
export function historyValue(field: string, value: string): string {
  if (["Loại phòng", "Trạng thái", "Trạng thái khai thác"].includes(field))
    return translateMessage(value);
  if (
    [
      "Người ở",
      "Tiện ích",
      "Tiện ích thu phí",
      "Tính 1 lần",
      "Đơn vị tính",
    ].includes(field) &&
    [
      "Không có",
      "Chưa có",
      "Chưa có người",
      "Đã gỡ khỏi phòng",
      "Có",
      "Không",
      "Không áp dụng",
    ].includes(value)
  )
    return translateMessage(value);
  return value;
}
