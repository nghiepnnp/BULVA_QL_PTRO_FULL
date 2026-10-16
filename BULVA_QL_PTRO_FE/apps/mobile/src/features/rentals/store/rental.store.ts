import { getIntlLocale } from '@/i18n/core';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  mockOccupancies, mockProperties, mockResidents, mockUnits, mockUnitHistory, mockUtilities, rentalOrganization,
  type Occupancy, type Property, type PropertyDraft, type Resident, type ResidentDraft,
  type Unit, type UnitDraft, type UnitHistoryChange, type UnitHistoryEntry, type UnitHistoryKind,
  type UtilityDefinition, type UtilityDraft,
} from "@package/shared";

export type StoreResult = { ok: true; id: string } | { ok: false; error: string };
export const mockOrganizationId = rentalOrganization.id;
const nextId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const normalized = (v: string) => v.trim().toLocaleLowerCase();
export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

export const money = (amount: number, currency = "VND") => {
  try {
    return new Intl.NumberFormat(getIntlLocale(), {
      style: "currency", currency, maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(getIntlLocale())} ${currency}`;
  }
};

export const cleanAmenities = (values: string[]) => [...new Map(values.map(v => v.trim()).filter(Boolean).map(v => [normalized(v), v])).values()];
const amenityText = (values?: string[]) => values?.length ? values.join(", ") : "Không có";
const peopleText = (occupancies: Occupancy[], residents: Resident[], unitId: string) => {
  const names = occupancies.filter(o => o.unitId === unitId && o.moveOutOn === null)
    .map(o => residents.find(r => r.id === o.residentId)?.fullName || "Người thuê không xác định");
  return names.length ? names.join(", ") : "Chưa có người";
};
const historyEntry = (unitId: string, kind: UnitHistoryKind, summary: string,
  changes: UnitHistoryChange[] = [], residentIds: string[] = []): UnitHistoryEntry => ({
  id: nextId(), organizationId: mockOrganizationId, unitId, kind, summary, changes,
  residentIds, occurredAt: new Date().toISOString(),
});
export const utilityCaption = (utility: UtilityDefinition) =>
  `${utility.name} · ${money(utility.unitPrice, utility.currencyCode)}${utility.chargeOnce ? "/lần" : `/${utility.inputUnit}`}`;
const utilityListText = (ids: string[], utilities: UtilityDefinition[]) =>
  ids.map(id => utilities.find(u => u.id === id)?.name || "Tiện ích không tồn tại").join(", ") || "Không có";
const unitChanges = (before: Unit, after: Unit, currency: string, utilities: UtilityDefinition[]): UnitHistoryChange[] => {
  const out: UnitHistoryChange[] = [];
  const compare = (field: string, a: string | number, b: string | number) => {
    if (a !== b) out.push({ field, before: String(a || "—"), after: String(b || "—") });
  };
  compare("Tên phòng", before.name, after.name);
  compare("Mã phòng", before.code, after.code);
  compare("Loại phòng", before.type, after.type);
  compare("Tầng", before.floor, after.floor);
  compare("Diện tích (m²)", before.areaM2, after.areaM2);
  compare("Sức chứa (người)", before.capacity, after.capacity);
  if (before.monthlyRent !== after.monthlyRent) {
    out.push({ field: "Giá niêm yết / tháng", before: money(before.monthlyRent, currency), after: money(after.monthlyRent, currency) });
  }
  compare("Trạng thái khai thác", before.status, after.status);
  compare("Mô tả", before.description, after.description);
  if (JSON.stringify(cleanAmenities(before.amenities || []).sort()) !== JSON.stringify(cleanAmenities(after.amenities || []).sort())) {
    out.push({ field: "Tiện ích", before: amenityText(before.amenities), after: amenityText(after.amenities) });
  }
  const beforeUtilities = [...new Set(before.utilityIds || [])].sort();
  const afterUtilities = [...new Set(after.utilityIds || [])].sort();
  if (JSON.stringify(beforeUtilities) !== JSON.stringify(afterUtilities)) {
    out.push({ field: "Tiện ích thu phí", before: utilityListText(beforeUtilities, utilities), after: utilityListText(afterUtilities, utilities) });
  }
  return out;
};

const normalizeUtility = (draft: UtilityDraft): UtilityDraft => ({
  name: draft.name.trim(), chargeOnce: draft.chargeOnce,
  inputUnit: draft.chargeOnce ? null : (draft.inputUnit || "").trim(),
  unitPrice: draft.unitPrice, currencyCode: draft.currencyCode.toUpperCase(),
});
export const validateUtility = (draft: UtilityDraft): string | null => {
  if (!draft.name.trim()) return "Vui lòng nhập tên tiện ích.";
  if (draft.name.trim().length > 100) return "Tên tiện ích tối đa 100 ký tự.";
  if (!draft.chargeOnce && !(draft.inputUnit || "").trim()) return "Vui lòng nhập đơn vị tính, ví dụ kWh, khối, chiếc.";
  if (!Number.isFinite(draft.unitPrice) || draft.unitPrice < 0) return "Đơn giá phải là số không âm.";
  if (!/^[A-Z]{3}$/.test(draft.currencyCode)) return "Mã tiền tệ không hợp lệ.";
  const maxDecimals = ["VND", "JPY", "KRW"].includes(draft.currencyCode) ? 0 : 2;
  if (Number(draft.unitPrice.toFixed(maxDecimals)) !== draft.unitPrice) return `Đơn giá ${draft.currencyCode} chỉ hỗ trợ tối đa ${maxDecimals} chữ số thập phân.`;
  return null;
};

interface DataState {
  properties: Property[];
  units: Unit[];
  residents: Resident[];
  occupancies: Occupancy[];
  unitHistory: UnitHistoryEntry[];
  utilities: UtilityDefinition[];
  preferredLocale: "vi" | "en";
  defaultCurrency: string;
  hydrated: boolean;
  addProperty: (draft: PropertyDraft) => StoreResult;
  updateProperty: (id: string, draft: PropertyDraft) => StoreResult;
  archiveProperty: (id: string) => StoreResult;
  addUnit: (draft: UnitDraft) => StoreResult;
  updateUnit: (id: string, draft: UnitDraft) => StoreResult;
  archiveUnit: (id: string) => StoreResult;
  addUtility: (draft: UtilityDraft) => StoreResult;
  updateUtility: (id: string, draft: UtilityDraft) => StoreResult;
  archiveUtility: (id: string) => StoreResult;
  addResident: (draft: ResidentDraft) => StoreResult;
  updateResident: (id: string, draft: ResidentDraft) => StoreResult;
  /** Atomic: either every selected person checks in, or no-one does. */
  recordMoveIns: (residentIds: string[], unitId: string, date: string) => StoreResult;
  recordMoveIn: (residentId: string, unitId: string, date: string) => StoreResult;
  recordMoveOut: (occupancyId: string, date: string) => StoreResult;
  setLocale: (locale: "vi" | "en") => void;
  setDefaultCurrency: (currency: string) => void;
  resetDemo: () => void;
}

const initial = () => ({
  properties: mockProperties.map(p => ({ ...p })),
  units: mockUnits.map(u => ({
    ...u, amenities: [...(u.amenities || [])],
    utilityIds: u.propertyId === "prop-3" ? ["utility-electric", "utility-water"]
      : ["utility-electric", "utility-water", "utility-wifi"],
  })),
  residents: mockResidents.map(r => ({ ...r })),
  occupancies: mockOccupancies.map(o => ({ ...o })),
  unitHistory: mockUnitHistory.map(e => ({ ...e, changes: e.changes.map(c => ({ ...c })), residentIds: [...e.residentIds] })),
  utilities: mockUtilities.map(u => ({ ...u })),
  preferredLocale: "vi" as const,
  defaultCurrency: "VND",
});

export const useRentalStore = create<DataState>()(persist((set, get) => ({
  ...initial(),
  hydrated: false,
  addProperty(draft) {
    if (!draft.name.trim() || !draft.code.trim() || !draft.address.trim() || !draft.city.trim()) return { ok: false, error: "Vui lòng nhập tên, mã, địa chỉ và thành phố." };
    if (get().properties.some(p => p.status !== "ARCHIVED" && normalized(p.code) === normalized(draft.code))) return { ok: false, error: "Mã bất động sản đã tồn tại." };
    const id = nextId();
    set(s => ({ properties: [{ ...draft, id, organizationId: mockOrganizationId, createdAt: todayLocal() }, ...s.properties] }));
    return { ok: true, id };
  },
  updateProperty(id, draft) {
    if (!draft.name.trim() || !draft.code.trim() || !draft.address.trim() || !draft.city.trim()) return { ok: false, error: "Vui lòng nhập đầy đủ thông tin bắt buộc." };
    if (get().properties.some(p => p.id !== id && p.status !== "ARCHIVED" && normalized(p.code) === normalized(draft.code))) return { ok: false, error: "Mã bất động sản đã tồn tại." };
    const previous = get().properties.find(p => p.id === id && p.status !== "ARCHIVED");
    if (!previous) return { ok: false, error: "Không tìm thấy bất động sản." };
    if (previous.currencyCode !== draft.currencyCode && get().units.some(u => u.propertyId === id && u.status !== "ARCHIVED")) return { ok: false, error: "Không thể đổi tiền tệ khi đã có phòng." };
    set(s => ({ properties: s.properties.map(p => p.id === id ? { ...p, ...draft } : p) }));
    return { ok: true, id };
  },
  archiveProperty(id) {
    if (get().units.some(u => u.propertyId === id && u.status !== "ARCHIVED")) return { ok: false, error: "Hãy lưu trữ toàn bộ phòng thuộc bất động sản trước." };
    if (!get().properties.some(p => p.id === id && p.status !== "ARCHIVED")) return { ok: false, error: "Không tìm thấy bất động sản." };
    set(s => ({ properties: s.properties.map(p => p.id === id ? { ...p, status: "ARCHIVED" } : p) }));
    return { ok: true, id };
  },
  addUnit(draft) {
    if (!draft.name.trim() || !draft.code.trim()) return { ok: false, error: "Vui lòng nhập tên và mã phòng." };
    if (!get().properties.some(p => p.id === draft.propertyId && p.status === "ACTIVE")) return { ok: false, error: "Bất động sản không hợp lệ." };
    if (get().units.some(u => u.propertyId === draft.propertyId && u.status !== "ARCHIVED" && normalized(u.code) === normalized(draft.code))) return { ok: false, error: "Mã phòng đã tồn tại trong bất động sản." };
    if (!validUnitNumbers(draft)) return { ok: false, error: "Kiểm tra lại diện tích, tiền thuê và sức chứa." };
    const utilityError = validateAssignedUtilities(draft, get().utilities, get().properties);
    if (utilityError) return { ok: false, error: utilityError };
    const id = nextId();
    const unit: Unit = { ...draft, id, organizationId: mockOrganizationId,
      amenities: cleanAmenities(draft.amenities || []), utilityIds: [...new Set(draft.utilityIds || [])] };
    set(s => ({
      units: [unit, ...s.units],
      unitHistory: [historyEntry(id, "UNIT_CREATED", "Tạo phòng mới", [{ field: "Phòng", before: "Chưa có", after: unit.name }]), ...s.unitHistory],
    }));
    return { ok: true, id };
  },
  updateUnit(id, draft) {
    if (!draft.name.trim() || !draft.code.trim()) return { ok: false, error: "Vui lòng nhập tên và mã phòng." };
    const previous = get().units.find(u => u.id === id && u.status !== "ARCHIVED");
    if (!previous) return { ok: false, error: "Không tìm thấy phòng." };
    if (previous.propertyId !== draft.propertyId) return { ok: false, error: "Chưa hỗ trợ chuyển phòng sang bất động sản khác." };
    if (get().units.some(u => u.id !== id && u.propertyId === draft.propertyId && u.status !== "ARCHIVED" && normalized(u.code) === normalized(draft.code))) return { ok: false, error: "Mã phòng đã tồn tại." };
    if (!validUnitNumbers(draft)) return { ok: false, error: "Kiểm tra lại diện tích, tiền thuê và sức chứa." };
    const occupants = get().occupancies.filter(o => o.unitId === id && o.moveOutOn === null).length;
    if (draft.status !== "ACTIVE" && occupants > 0) return { ok: false, error: "Phòng đang có người ở. Hãy ghi nhận trả phòng trước." };
    if (draft.capacity < occupants) return { ok: false, error: "Sức chứa không thể nhỏ hơn số người đang ở." };
    const utilityError = validateAssignedUtilities(draft, get().utilities, get().properties);
    if (utilityError) return { ok: false, error: utilityError };
    const next: Unit = { ...previous, ...draft, amenities: cleanAmenities(draft.amenities || []), utilityIds: [...new Set(draft.utilityIds || [])] };
    const currency = get().properties.find(p => p.id === previous.propertyId)?.currencyCode || "VND";
    const changes = unitChanges(previous, next, currency, get().utilities);
    set(s => ({
      units: s.units.map(u => u.id === id ? next : u),
      unitHistory: changes.length
        ? [historyEntry(id, "UNIT_UPDATED", "Cập nhật thông tin phòng", changes), ...s.unitHistory]
        : s.unitHistory,
    }));
    return { ok: true, id };
  },
  archiveUnit(id) {
    const unit = get().units.find(u => u.id === id && u.status !== "ARCHIVED");
    if (!unit) return { ok: false, error: "Không tìm thấy phòng." };
    if (get().occupancies.some(o => o.unitId === id && o.moveOutOn === null)) return { ok: false, error: "Phòng đang có người ở. Hãy cho người thuê trả phòng trước." };
    set(s => ({
      units: s.units.map(u => u.id === id ? { ...u, status: "ARCHIVED" } : u),
      unitHistory: [historyEntry(id, "UNIT_ARCHIVED", "Lưu trữ phòng", [{ field: "Trạng thái", before: unit.status, after: "ARCHIVED" }]), ...s.unitHistory],
    }));
    return { ok: true, id };
  },
  addUtility(draft) {
    const payload = normalizeUtility(draft);
    const invalid = validateUtility(payload);
    if (invalid) return { ok: false, error: invalid };
    if (get().utilities.some(u => u.active && u.currencyCode === payload.currencyCode && normalized(u.name) === normalized(payload.name))) {
      return { ok: false, error: `Tên tiện ích đã tồn tại cho tiền tệ ${payload.currencyCode}.` };
    }
    const id = nextId();
    set(s => ({ utilities: [{ ...payload, id, organizationId: mockOrganizationId, active: true, createdAt: todayLocal() }, ...s.utilities] }));
    return { ok: true, id };
  },
  updateUtility(id, draft) {
    const before = get().utilities.find(u => u.id === id && u.active);
    if (!before) return { ok: false, error: "Không tìm thấy tiện ích." };
    const payload = normalizeUtility(draft);
    const invalid = validateUtility(payload);
    if (invalid) return { ok: false, error: invalid };
    if (get().utilities.some(u => u.id !== id && u.active && u.currencyCode === payload.currencyCode && normalized(u.name) === normalized(payload.name))) {
      return { ok: false, error: `Tên tiện ích đã tồn tại cho tiền tệ ${payload.currencyCode}.` };
    }
    const affected = get().units.filter(u => u.status !== "ARCHIVED" && (u.utilityIds || []).includes(id));
    if (affected.some(u => get().properties.find(p => p.id === u.propertyId)?.currencyCode !== payload.currencyCode)) {
      return { ok: false, error: "Tiện ích đang dùng tại phòng có loại tiền khác. Hãy bỏ gán trước khi đổi tiền tệ." };
    }
    const after: UtilityDefinition = { ...before, ...payload };
    const changes: UnitHistoryChange[] = [];
    if (before.name !== after.name) changes.push({ field: "Tên tiện ích", before: before.name, after: after.name });
    if (before.chargeOnce !== after.chargeOnce) changes.push({ field: "Tính 1 lần", before: before.chargeOnce ? "Có" : "Không", after: after.chargeOnce ? "Có" : "Không" });
    if (before.inputUnit !== after.inputUnit) changes.push({ field: "Đơn vị tính", before: before.inputUnit || "Không áp dụng", after: after.inputUnit || "Không áp dụng" });
    if (before.unitPrice !== after.unitPrice || before.currencyCode !== after.currencyCode) {
      changes.push({ field: "Đơn giá tiện ích", before: money(before.unitPrice, before.currencyCode), after: money(after.unitPrice, after.currencyCode) });
    }
    set(s => ({
      utilities: s.utilities.map(u => u.id === id ? after : u),
      unitHistory: changes.length ? [
        ...affected.map(u => historyEntry(u.id, "UTILITY_UPDATED", `Sửa tiện ích ${before.name}`, changes)),
        ...s.unitHistory,
      ] : s.unitHistory,
    }));
    return { ok: true, id };
  },
  archiveUtility(id) {
    const utility = get().utilities.find(u => u.id === id && u.active);
    if (!utility) return { ok: false, error: "Không tìm thấy tiện ích." };
    const affected = get().units.filter(u => u.status !== "ARCHIVED" && (u.utilityIds || []).includes(id));
    set(s => ({
      utilities: s.utilities.map(u => u.id === id ? { ...u, active: false } : u),
      units: s.units.map(u => (u.utilityIds || []).includes(id) ? { ...u, utilityIds: u.utilityIds!.filter(uid => uid !== id) } : u),
      unitHistory: [
        ...affected.map(u => historyEntry(u.id, "UTILITY_REMOVED", `Ngừng sử dụng tiện ích ${utility.name}`,
          [{ field: "Tiện ích thu phí", before: utility.name, after: "Đã gỡ khỏi phòng" }])),
        ...s.unitHistory,
      ],
    }));
    return { ok: true, id };
  },
  addResident(draft) {
    if (!draft.fullName.trim()) return { ok: false, error: "Vui lòng nhập họ tên người thuê." };
    const id = nextId();
    set(s => ({ residents: [{ ...draft, id, organizationId: mockOrganizationId, createdAt: todayLocal() }, ...s.residents] }));
    return { ok: true, id };
  },
  updateResident(id, draft) {
    if (!draft.fullName.trim()) return { ok: false, error: "Vui lòng nhập họ tên người thuê." };
    if (!get().residents.some(r => r.id === id)) return { ok: false, error: "Không tìm thấy người thuê." };
    set(s => ({ residents: s.residents.map(r => r.id === id ? { ...r, ...draft } : r) }));
    return { ok: true, id };
  },
  recordMoveIns(residentIds, unitId, date) {
    if (!validDate(date)) return { ok: false, error: "Ngày nhận phòng phải có định dạng YYYY-MM-DD hợp lệ." };
    if (date > todayLocal()) return { ok: false, error: "Không thể ghi nhận nhận phòng thực tế trong tương lai." };
    if (!residentIds.length) return { ok: false, error: "Hãy chọn ít nhất một người thuê." };
    if (new Set(residentIds).size !== residentIds.length) return { ok: false, error: "Danh sách người thuê có người bị trùng." };
    const state = get();
    const unit = state.units.find(u => u.id === unitId && u.status === "ACTIVE");
    if (!unit || !state.properties.some(p => p.id === unit.propertyId && p.status === "ACTIVE")) return { ok: false, error: "Vui lòng chọn phòng đang khai thác." };
    const chosenResidents = residentIds.map(id => state.residents.find(r => r.id === id));
    if (chosenResidents.some(r => !r)) return { ok: false, error: "Danh sách người thuê không hợp lệ." };
    if (residentIds.some(id => state.occupancies.some(o => o.residentId === id && o.moveOutOn === null))) return { ok: false, error: "Một hoặc nhiều người đã được ghi nhận đang cư trú tại phòng khác." };
    const existing = state.occupancies.filter(o => o.unitId === unitId && o.moveOutOn === null);
    if (existing.length + residentIds.length > unit.capacity) return { ok: false, error: `Phòng chỉ còn ${unit.capacity - existing.length} chỗ. Bạn đang chọn ${residentIds.length} người.` };
    const before = peopleText(state.occupancies, state.residents, unitId);
    const newRecords = residentIds.map((residentId, index): Occupancy => ({
      id: nextId(), organizationId: mockOrganizationId, unitId, residentId,
      moveInOn: date, moveOutOn: null, isPrimary: existing.length === 0 && index === 0,
    }));
    const names = chosenResidents.map(r => r!.fullName);
    const after = peopleText([...newRecords, ...state.occupancies], state.residents, unitId);
    const history = historyEntry(unitId, "MOVE_IN", `Nhận phòng: ${names.join(", ")}`,
      [{ field: "Người ở", before, after }], residentIds);
    // All-or-nothing update: no partial move-ins if any validation fails.
    set(s => ({ occupancies: [...newRecords, ...s.occupancies], unitHistory: [history, ...s.unitHistory] }));
    return { ok: true, id: newRecords[0].id };
  },
  recordMoveIn(residentId, unitId, date) {
    return get().recordMoveIns([residentId], unitId, date);
  },
  recordMoveOut(occupancyId, date) {
    if (!validDate(date)) return { ok: false, error: "Ngày trả phòng phải có định dạng YYYY-MM-DD hợp lệ." };
    if (date > todayLocal()) return { ok: false, error: "Ngày trả phòng thực tế không được ở tương lai." };
    const state = get();
    const occupancy = state.occupancies.find(o => o.id === occupancyId && o.moveOutOn === null);
    if (!occupancy) return { ok: false, error: "Không tìm thấy hồ sơ cư trú đang hoạt động." };
    if (date < occupancy.moveInOn) return { ok: false, error: "Ngày trả phòng không được sớm hơn ngày nhận phòng." };
    const before = peopleText(state.occupancies, state.residents, occupancy.unitId);
    const rest = state.occupancies.filter(o => o.unitId === occupancy.unitId && o.id !== occupancyId && o.moveOutOn === null);
    const nextPrimary = occupancy.isPrimary && rest.length ? rest[0].id : null;
    const updated = state.occupancies.map(o => o.id === occupancyId ? { ...o, moveOutOn: date, isPrimary: false }
      : o.id === nextPrimary ? { ...o, isPrimary: true } : o);
    const after = peopleText(updated, state.residents, occupancy.unitId);
    const name = state.residents.find(r => r.id === occupancy.residentId)?.fullName || "Người thuê";
    set(s => ({
      occupancies: updated,
      unitHistory: [historyEntry(occupancy.unitId, "MOVE_OUT", `Trả phòng: ${name}`,
        [{ field: "Người ở", before, after }], [occupancy.residentId]), ...s.unitHistory],
    }));
    return { ok: true, id: occupancyId };
  },
  setLocale(locale) { set({ preferredLocale: locale }); },
  setDefaultCurrency(currency) { set({ defaultCurrency: currency }); },
  resetDemo() { set({ ...initial() }); },
}), {
  name: "rentalos-demo-rentals-v1", // Keep key: preserve existing local demo data.
  version: 3,
  storage: createJSONStorage(() => AsyncStorage),
  partialize: s => ({
    properties: s.properties, units: s.units, residents: s.residents, occupancies: s.occupancies,
    unitHistory: s.unitHistory, utilities: s.utilities, preferredLocale: s.preferredLocale, defaultCurrency: s.defaultCurrency,
  }),
  migrate: (persisted, version) => {
    const previous = (persisted || {}) as Partial<DataState>;
    // v1 users keep all their properties, rooms and occupancies; history starts now.
    return {
      ...initial(), ...previous,
      units: (previous.units || initial().units).map(u => ({
        ...u, amenities: [...(u.amenities || [])],
        utilityIds: [...new Set(u.utilityIds || [])],
      })),
      utilities: version < 3 ? mockUtilities.map(u => ({ ...u })) : (previous.utilities || mockUtilities),
      unitHistory: version < 2 ? [] : (previous.unitHistory || []),
    } as DataState;
  },
  onRehydrateStorage: () => () => useRentalStore.setState({ hydrated: true }),
}));

const validUnitNumbers = (draft: UnitDraft) => Number.isFinite(draft.monthlyRent) && draft.monthlyRent >= 0
  && Number.isFinite(draft.areaM2) && draft.areaM2 >= 0 && Number.isInteger(draft.capacity) && draft.capacity >= 1;
export const activeUnits = (units: Unit[]) => units.filter(u => u.status !== "ARCHIVED");
export const currentOccupancies = (occupancies: Occupancy[]) => occupancies.filter(o => o.moveOutOn === null);
export const unitOccupants = (occupancies: Occupancy[], unitId: string) => occupancies.filter(o => o.unitId === unitId && o.moveOutOn === null);
export const unitIsOccupied = (occupancies: Occupancy[], unitId: string) => occupancies.some(o => o.unitId === unitId && o.moveOutOn === null);

/** Charge catalogue is scoped to the workspace; a room can only use fees in its property currency. */
const validateAssignedUtilities = (draft: UnitDraft, utilities: UtilityDefinition[], properties: Property[]): string | null => {
  const property = properties.find(p => p.id === draft.propertyId);
  if (!property) return "Không tìm thấy bất động sản của phòng.";
  for (const id of draft.utilityIds || []) {
    const fee = utilities.find(u => u.id === id && u.active);
    if (!fee) return "Có tiện ích đã bị ngừng sử dụng. Hãy chọn lại.";
    if (fee.currencyCode !== property.currencyCode) return `Tiện ích ${fee.name} có tiền tệ ${fee.currencyCode}, khác tiền tệ phòng (${property.currencyCode}).`;
  }
  return null;
};
