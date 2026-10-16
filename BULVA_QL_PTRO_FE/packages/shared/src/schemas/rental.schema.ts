/** Simple shared DTOs for Phase 1.1; backend contracts can later replace the mock adapter. */
export type PropertyType = "ROOMING_HOUSE" | "APARTMENT_BUILDING" | "HOUSE" | "OTHER";
export type UnitType = "ROOM" | "APARTMENT" | "HOUSE" | "OTHER";
export type OperationalStatus = "ACTIVE" | "UNAVAILABLE" | "ARCHIVED";

export interface Organization {
  id: string;
  name: string;
  countryCode: string;
  defaultCurrency: string;
  timezone: string;
}
export interface Property {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  countryCode: string;
  currencyCode: string;
  timezone: string;
  description: string;
  accent: string;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}
export interface Unit {
  id: string;
  organizationId: string;
  propertyId: string;
  code: string;
  name: string;
  type: UnitType;
  floor: string;
  areaM2: number;
  capacity: number;
  monthlyRent: number;
  amenities?: string[]; // physical features (air conditioner, balcony, etc.)
  utilityIds?: string[]; // selected billable utility definitions; prices live in UtilityDefinition
  status: OperationalStatus;
  description: string;
}
export interface Resident {
  id: string;
  organizationId: string;
  fullName: string;
  phone: string;
  email: string;
  emergencyContact: string;
  notes: string;
  createdAt: string;
}
export interface Occupancy {
  id: string;
  organizationId: string;
  unitId: string;
  residentId: string;
  moveInOn: string; // local business date YYYY-MM-DD
  moveOutOn: string | null;
  isPrimary: boolean;
}
export type PropertyDraft = Omit<Property, "id" | "organizationId" | "createdAt">;
export type UnitDraft = Omit<Unit, "id" | "organizationId">;
export type ResidentDraft = Omit<Resident, "id" | "organizationId" | "createdAt">;

/** Local, per-unit activity history for MVP. NOT a server-side immutable audit log. */
export type UnitHistoryKind = "UNIT_CREATED" | "UNIT_UPDATED" | "UNIT_ARCHIVED" | "MOVE_IN" | "MOVE_OUT" | "UTILITY_UPDATED" | "UTILITY_REMOVED";
export interface UnitHistoryChange {
  field: string;
  before: string;
  after: string;
}
export interface UnitHistoryEntry {
  id: string;
  organizationId: string;
  unitId: string;
  kind: UnitHistoryKind;
  occurredAt: string; // UTC ISO 8601
  summary: string;
  changes: UnitHistoryChange[];
  residentIds: string[];
}

/** Configurable charge definition in Settings; chargeOnce means quantity is always 1. */
export interface UtilityDefinition {
  id: string;
  organizationId: string;
  name: string;
  chargeOnce: boolean;
  inputUnit: string | null; // null if chargeOnce
  unitPrice: number;
  currencyCode: string; // snapshot when created or explicitly edited
  active: boolean;
  createdAt: string;
}
export type UtilityDraft = Pick<UtilityDefinition, "name" | "chargeOnce" | "inputUnit" | "unitPrice" | "currencyCode">;
