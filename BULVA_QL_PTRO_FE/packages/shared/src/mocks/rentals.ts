import type { Organization, Property, Unit, Resident, Occupancy, UtilityDefinition, UnitHistoryEntry } from "../schemas/rental.schema";

export const rentalOrganization: Organization = {
  id: "org-demo", name: "My Rental Workspace", countryCode: "VN",
  defaultCurrency: "VND", timezone: "Asia/Ho_Chi_Minh",
};
export const mockProperties: Property[] = [
  { id: "prop-1", organizationId: "org-demo", code: "SUNRISE", name: "Sunrise Residence", type: "ROOMING_HOUSE", address: "128 Nguyễn Văn Linh, Quận 7", city: "Hồ Chí Minh", countryCode: "VN", currencyCode: "VND", timezone: "Asia/Ho_Chi_Minh", description: "Nhà trọ gần trung tâm, có thang máy", accent: "#E5E9FD", status: "ACTIVE", createdAt: "2026-07-01" },
  { id: "prop-2", organizationId: "org-demo", code: "GREEN", name: "Green House", type: "APARTMENT_BUILDING", address: "45 Trần Não, An Khánh", city: "Hồ Chí Minh", countryCode: "VN", currencyCode: "VND", timezone: "Asia/Ho_Chi_Minh", description: "Căn hộ mini hiện đại", accent: "#DEF4E9", status: "ACTIVE", createdAt: "2026-08-08" },
  { id: "prop-3", organizationId: "org-demo", code: "RIVER", name: "Riverside Home", type: "HOUSE", address: "20 Nguyễn Thị Minh Khai", city: "Đà Nẵng", countryCode: "VN", currencyCode: "VND", timezone: "Asia/Ho_Chi_Minh", description: "Nhà nguyên căn cho thuê dài hạn", accent: "#FFF1DF", status: "ACTIVE", createdAt: "2026-09-15" },
];
export const mockUnits: Unit[] = [
  ...Array.from({ length: 7 }, (_, i): Unit => ({ id: `unit-${i+1}`, organizationId: "org-demo", propertyId: "prop-1", code: `P${101+i}`, name: `Phòng ${101+i}`, type: "ROOM", floor: String(i<4?1:2), areaM2: 24+(i%3)*4, capacity: 2, monthlyRent: 3500000+i*150000, status: i===6?"UNAVAILABLE":"ACTIVE", amenities:["Máy lạnh", "Nhà vệ sinh riêng", "Wi-Fi"], description: i===6?"Đang sửa chữa":"Máy lạnh, nhà vệ sinh riêng" })),
  ...Array.from({ length: 4 }, (_, i): Unit => ({ id: `unit-${i+8}`, organizationId: "org-demo", propertyId: "prop-2", code: `A${201+i}`, name: `Căn hộ A${201+i}`, type: "APARTMENT", floor: "2", areaM2: 38+i*4, capacity: 3, monthlyRent: 6200000+i*400000, status: "ACTIVE", amenities:["Bếp", "Ban công", "Wi-Fi"], description:"Có bếp và ban công" })),
  { id:"unit-12", organizationId:"org-demo", propertyId:"prop-3", code:"H01", name:"Nhà Riverside", type:"HOUSE", floor:"", areaM2:110, capacity:5, monthlyRent:12000000, status:"ACTIVE", amenities:["Sân để xe", "Bếp", "Máy lạnh"], description:"3 phòng ngủ, sân để xe" },
];
export const mockResidents: Resident[] = [
  {id:"res-1",organizationId:"org-demo",fullName:"Nguyễn Minh Anh",phone:"+84901234567",email:"minhanh@example.com",emergencyContact:"",notes:"",createdAt:"2026-07-10"},
  {id:"res-2",organizationId:"org-demo",fullName:"Trần Quốc Bảo",phone:"+84902345678",email:"bao@example.com",emergencyContact:"",notes:"",createdAt:"2026-07-15"},
  {id:"res-3",organizationId:"org-demo",fullName:"Lê Thị Hoa",phone:"+84903456789",email:"hoa@example.com",emergencyContact:"",notes:"",createdAt:"2026-08-01"},
  {id:"res-4",organizationId:"org-demo",fullName:"Phạm Nhật Nam",phone:"+84904567890",email:"nam@example.com",emergencyContact:"",notes:"",createdAt:"2026-08-12"},
  {id:"res-5",organizationId:"org-demo",fullName:"Hoàng Thu Hà",phone:"+84905678901",email:"ha@example.com",emergencyContact:"",notes:"",createdAt:"2026-09-01"},
  {id:"res-6",organizationId:"org-demo",fullName:"Đỗ Minh Tú",phone:"+84906789012",email:"tu@example.com",emergencyContact:"",notes:"",createdAt:"2026-09-20"},
  {id:"res-7",organizationId:"org-demo",fullName:"Võ Thanh Bình",phone:"+84907890123",email:"binh@example.com",emergencyContact:"",notes:"",createdAt:"2026-10-01"},
  {id:"res-8",organizationId:"org-demo",fullName:"Ngô Mỹ Linh",phone:"+84908901234",email:"linh@example.com",emergencyContact:"",notes:"",createdAt:"2026-10-04"},
];
export const mockOccupancies: Occupancy[] = [
  {id:"occ-1",organizationId:"org-demo",residentId:"res-1",unitId:"unit-1",moveInOn:"2026-07-15",moveOutOn:null,isPrimary:true},
  {id:"occ-2",organizationId:"org-demo",residentId:"res-2",unitId:"unit-2",moveInOn:"2026-08-01",moveOutOn:null,isPrimary:true},
  {id:"occ-3",organizationId:"org-demo",residentId:"res-3",unitId:"unit-3",moveInOn:"2026-08-05",moveOutOn:null,isPrimary:true},
  {id:"occ-4",organizationId:"org-demo",residentId:"res-4",unitId:"unit-4",moveInOn:"2026-08-15",moveOutOn:null,isPrimary:true},
  {id:"occ-5",organizationId:"org-demo",residentId:"res-5",unitId:"unit-8",moveInOn:"2026-09-01",moveOutOn:null,isPrimary:true},
  {id:"occ-6",organizationId:"org-demo",residentId:"res-6",unitId:"unit-9",moveInOn:"2026-09-21",moveOutOn:null,isPrimary:true},
  {id:"occ-7",organizationId:"org-demo",residentId:"res-7",unitId:"unit-10",moveInOn:"2026-10-02",moveOutOn:null,isPrimary:true},
  {id:"occ-8",organizationId:"org-demo",residentId:"res-8",unitId:"unit-10",moveInOn:"2026-10-06",moveOutOn:null,isPrimary:false},
];

/** Seed only: illustrates the new unit history UI; real prior actions cannot be reconstructed. */
export const mockUnitHistory: UnitHistoryEntry[] = [
  {
    id: "hist-demo-1", organizationId: "org-demo", unitId: "unit-1",
    kind: "MOVE_IN", occurredAt: "2026-07-15T08:30:00.000Z",
    summary: "Nhận phòng: Nguyễn Minh Anh", residentIds: ["res-1"],
    changes: [{ field: "Người ở", before: "Chưa có người", after: "Nguyễn Minh Anh" }],
  },
  {
    id: "hist-demo-2", organizationId: "org-demo", unitId: "unit-1",
    kind: "UNIT_UPDATED", occurredAt: "2026-09-01T03:00:00.000Z",
    summary: "Cập nhật giá niêm yết phòng", residentIds: [],
    changes: [{ field: "Giá niêm yết / tháng", before: "3.300.000 ₫", after: "3.500.000 ₫" }],
  },
];

export const mockUtilities: UtilityDefinition[] = [
  { id: "utility-electric", organizationId: "org-demo", name: "Điện", chargeOnce: false, inputUnit: "kWh", unitPrice: 3500, currencyCode: "VND", active: true, createdAt: "2026-10-01" },
  { id: "utility-water", organizationId: "org-demo", name: "Nước", chargeOnce: false, inputUnit: "khối", unitPrice: 20000, currencyCode: "VND", active: true, createdAt: "2026-10-01" },
  { id: "utility-wifi", organizationId: "org-demo", name: "Wi-Fi", chargeOnce: true, inputUnit: null, unitPrice: 100000, currencyCode: "VND", active: true, createdAt: "2026-10-01" },
  { id: "utility-parking", organizationId: "org-demo", name: "Gửi xe", chargeOnce: true, inputUnit: null, unitPrice: 120000, currencyCode: "VND", active: true, createdAt: "2026-10-01" },
];
