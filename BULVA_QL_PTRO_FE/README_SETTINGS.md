# RentalOS settings

Settings now groups account, application preferences, privacy/security, support/legal and sign-out. Utilities is a dedicated action on Overview. Light mode remains the default; light/dark/system share the same semantic palette across the whole mobile app. Appearance, notification choices and marketing consent are persisted locally. Vietnamese and English are supported throughout the mobile UI. The selected language is persisted, including after sign-out. User-entered names, addresses and notes are not translated.

## Replace the temporary links

Edit `apps/mobile/.env` (the same keys are documented in `.env.example`):

```
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://your-domain/privacy
EXPO_PUBLIC_TERMS_URL=https://your-domain/terms
EXPO_PUBLIC_SUPPORT_URL=https://your-domain/support
EXPO_PUBLIC_SUPPORT_EMAIL=support@your-domain
EXPO_PUBLIC_USE_PLACEHOLDER_LINKS=false
```

Current example.com URLs are placeholders requested for development, not RentalOS legal documents. Keep the placeholder flag true until all URLs/contact details are real. Restart Expo with `pnpm --filter @starter/mobile exec expo start -c` after changing env; release builds must be rebuilt. EXPO_PUBLIC values are public, never put secrets in them.

Privacy and terms are public routes (`/legal/privacy`, `/legal/terms`) reachable from Settings, login and registration. Local text explicitly covers the demo; a real policy must document the actual service/provider, data, recipients, retention and deletion. Add the real privacy URL in App Store Connect as well.

## Working in this demo

- Edit display name; persist it across logout/sign-in on this device.
- Persist appearance and notification category preferences; marketing defaults off and can be withdrawn from either notifications or privacy.
- Open device settings (native only; browser guidance on web). No fake permission status and no permission prompts on startup.
- Account deletion: review data scope, type email, acknowledge consequences, final confirm. Clear persisted rental data, local profile and tokens; clear query cache and sign out. Empty arrays remain as non-personal defaults so deleted data does not reappear on restart. This is deletion of local demo data, not server account deletion.
- Utilities catalogue/editing remains unchanged, accessed from Overview.
- Data reset moved to About and remains demo-only, with confirmation.

## Backend/store integration still required before a real release

The repository has no server account registration/deletion/password-change API, notification delivery or IAP implementation. Their unavailable states are explicit; no fake deletion request, password change, restored purchase or push delivery is reported. The production account guard refuses local profile/deletion operations. Typing the email is a confirmation, not identity verification for a real account.

Before enabling these services, connect authenticated account update/password-change/deletion to the real backend. Reauthenticate real deletion, delete associated personal records, revoke sessions and any Sign in with Apple tokens if used; show actual retention reasons, processing status/estimated completion where applicable. Wire push permissions/delivery to stored choices and respect marketing withdrawal. Add StoreKit entitlements, actual product prices/terms, management and restore operations only when digital subscriptions are offered. Currently the app uses email/password demo auth and sells nothing; Google/Apple native sign-in adapters are documented in README_SOCIAL_AUTH.md; payments, chat and user moderation were not added.

## Verification

`pnpm typecheck`, `pnpm check:source`, `pnpm test:mobile-settings`, `pnpm test:mobile-i18n`, `pnpm check:expo`.

The account tests use actual Zustand persistence with asynchronous in-memory storage and isolate all data from the user's real device. They cover wrong identity/email, production guard, deletion persistence, storage failure, profile updates and consent withdrawal.

Reference requirements checked on 16 October 2026:
- https://developer.apple.com/app-store/review/guidelines/ (5.1.1, 4.8, 3.1.2)
- https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion

## Mobile localization

Vietnamese is the default. Settings → Language switches Vietnamese/English immediately and remembers the choice on this device. Translation dictionaries live in `apps/mobile/src/i18n/locales/vi.json` and `en.json`; `en-one.json` contains singular count overrides. Keep matching keys and interpolation parameters in both dictionaries.

Use stable `UPPER_SNAKE_CASE` keys, for example `t('TEN_CUA_BAN')` or `t('SO_LUONG_DON_VI', { p0: value })` for interface text and call `useLocale()` in components that render translations so they update when the preference changes. Pass `count` for count labels without an interpolated number. Use `formatDate()` and `getIntlLocale()` for locale-sensitive formatting. Translate labels and schema values at display time; preserve user-entered names, addresses, notes and canonical stored history. Run `pnpm test:mobile-i18n` to check dictionary coverage, interpolation, switching and count/date formats.

`TranslationKey` is inferred from `vi.json`; TypeScript rejects missing keys. Keep English and singular keys aligned. `translateMessage()` is only a compatibility adapter for canonical service errors, enum labels and existing stored history. `message-aliases.json` preserves old wording that differs from Vietnamese display copy; its keys also use constants. Do not use this adapter for new UI labels or user-entered names/notes. Keep layout whitespace outside translation keys.
