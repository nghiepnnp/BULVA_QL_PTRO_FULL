import type { User } from '@package/shared';
import { clearTokens } from '@/services/token-storage';
import { readStoredValue, removeStoredValue, writeStoredValue } from '@/services/platform-storage';
import { useRentalStore } from '@/features/rentals/store/rental.store';
import { usePreferencesStore } from '../store/preferences.store';
import { isDemo } from './settings-config';

const PROFILE_KEY = 'rentalos_mock_profile';
function assertDemo() {
  if (!isDemo)
    throw new Error(
      'Dịch vụ tài khoản hiện chưa sẵn sàng. Vui lòng thử lại khi dịch vụ được kết nối.',
    );
}
export async function updateLocalProfile(user: User, name: string): Promise<User> {
  assertDemo();
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 80)
    throw new Error('Tên hiển thị cần từ 2 đến 80 ký tự.');
  const updated = { ...user, name: trimmed };
  await writeStoredValue(PROFILE_KEY, JSON.stringify(updated));
  return updated;
}
/** Local demo deletion only. Never reports that a server-side account was deleted. */
export async function deleteLocalAccount(user: User, confirmationEmail: string) {
  assertDemo();
  if (confirmationEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
    throw new Error('Email xác nhận chưa khớp với tài khoản đang đăng nhập.');
  }
  const stored = await readStoredValue(PROFILE_KEY);
  if (stored && (JSON.parse(stored) as User).id !== user.id) {
    throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.');
  }
  if (!useRentalStore.persist.hasHydrated()) await useRentalStore.persist.rehydrate();
  if (!usePreferencesStore.persist.hasHydrated()) await usePreferencesStore.persist.rehydrate();
  // Persist empty data, rather than reseeding the sample workspace on next launch.
  // Zustand persist returns the storage promise at runtime; await the write before clearing identity.
  await useRentalStore.setState({
    properties: [],
    units: [],
    residents: [],
    occupancies: [],
    unitHistory: [],
    utilities: [],
    preferredLocale: 'vi',
    defaultCurrency: 'VND',
  });
  await usePreferencesStore.setState({
    appearance: 'light',
    notifications: {
      rent: false,
      invoices: false,
      contracts: false,
      maintenance: false,
      marketing: false,
    },
  });
  await removeStoredValue(PROFILE_KEY);
  await clearTokens();
}
