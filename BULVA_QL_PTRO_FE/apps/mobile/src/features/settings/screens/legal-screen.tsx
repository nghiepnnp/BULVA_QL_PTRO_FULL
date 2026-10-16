import { t } from "@/i18n/core";
import { useLocale } from "@/i18n/use-locale";
import { Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActionButton,
  Page,
  PageHeader,
  SmallButton,
} from "@/components/ui/components";
import { showAlert } from "@/components/ui/feedback";
import { Notice, Paragraph } from "../components/settings-ui";
import {
  isDemo,
  openExternal,
  settingsConfig,
} from "../services/settings-config";

export default function LegalScreen() {
  useLocale();
  const { document } = useLocalSearchParams<{ document: string }>();
  const router = useRouter();
  const privacy = document === "privacy";
  const valid = privacy || document === "terms";
  const url = privacy ? settingsConfig.privacyUrl : settingsConfig.termsUrl;
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/");
  return (
    <Page>
      <PageHeader
        title={
          valid
            ? privacy
              ? t("CHINH_SACH_BAO_MAT")
              : t("DIEU_KHOAN_SU_DUNG")
            : t("KHONG_TIM_THAY")
        }
        eyebrow="RENTALOS OWNER"
        right={<SmallButton label={t("DONG")} onPress={close} />}
      />
      {!valid ? (
        <Notice>{t("TAI_LIEU_NAY_KHONG_TON_TAI")}</Notice>
      ) : (
        <>
          {url ? (
            <>
              <Notice>
                {settingsConfig.placeholderLinks
                  ? t(
                      "LIEN_KET_MINH_HOA_CHUA_PHAI_CHINH_SACH_CHINH_THUC_CUA_RENTALOS",
                    )
                  : t("BAN_CHINH_THUC_DUOC_CONG_BO_TAI_DUONG_DAN_BEN_DUOI")}
              </Notice>
              <ActionButton
                title={
                  settingsConfig.placeholderLinks
                    ? t("MO_LIEN_KET_MAU")
                    : t("MO_TAI_LIEU_CHINH_THUC")
                }
                icon="open-outline"
                onPress={() => {
                  void openExternal(url).catch((error) =>
                    showAlert(t("KHONG_MO_DUOC_TAI_LIEU"), error.message),
                  );
                }}
              />
              <Text
                selectable
                className="mb-6 mt-3 text-xs leading-5 text-muted"
              >
                {url}
              </Text>
            </>
          ) : (
            <Notice>
              {t("NOI_DUNG_DUOI_DAY_MO_TA_BAN_TRAI_NGHIEM_TREN_THIET_BI")}
            </Notice>
          )}
          {!isDemo && !url && (
            <Notice danger>
              {t("CHUA_CO_TAI_LIEU_CHINH_THUC_CHO_CHE_DO_KET_NOI_DICH")}
            </Notice>
          )}
          <Text className="mb-6 text-[11px] text-muted">
            {t("PHAM_VI_BAN_DEMO_RENTALOS_OWNER_CAP_NHAT_16_10_2026")}
          </Text>
          {privacy ? (
            <>
              <Paragraph title={t("NOI_DUNG_1_DU_LIEU_DUOC_SU_DUNG")}>
                {t("BAN_DEMO_LUU_TEN_HIEN_THI_EMAIL_VA_PHIEN_DANG_NHAP_THONG")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_2_NOI_LUU_TRU_CHIA_SE")}>
                {t("TRONG_CHE_DO_DEMO_DU_LIEU_QUAN_LY_DUOC_LUU_TREN_THIET")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_3_THOI_GIAN_LUU_GIU")}>
                {t("DU_LIEU_CUC_BO_DUOC_GIU_CHO_DEN_KHI_BAN_XOA_TAI")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_4_LUA_CHON_QUYEN_CUA_BAN")}>
                {t("BAN_CO_THE_SUA_TEN_HIEN_THI_QUAN_LY_DU_LIEU_DA")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_5_XOA_TAI_KHOAN_DU_LIEU")}>
                {t("VAO_CAI_DAT_XOA_TAI_KHOAN_DE_XEM_DU_LIEU_BI_XOA")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_6_LIEN_HE")}>
                {settingsConfig.supportEmail && !settingsConfig.placeholderLinks
                  ? t("LIEN_HE_P0_NEU_CAN_TRAO_DOI_VE_DU_LIEU_CUA_BAN", {
                      p0: settingsConfig.supportEmail,
                    })
                  : t(
                      "KENH_LIEN_HE_CHINH_THUC_CHUA_DUOC_CONG_BO_TRONG_BAN_TRAI",
                    )}
              </Paragraph>
            </>
          ) : (
            <>
              <Paragraph title={t("NOI_DUNG_1_PHAM_VI_SU_DUNG")}>
                {t(
                  "RENTALOS_OWNER_PHIEN_BAN_DEMO_CHO_PHEP_TRAI_NGHIEM_QUAN_LY_BAT",
                )}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_2_TRACH_NHIEM_VOI_DU_LIEU")}>
                {t("CHI_NHAP_DU_LIEU_MAU_HOAC_DU_LIEU_BAN_CO_QUYEN_SU")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_3_PHI_DANG_KY")}>
                {t("BAN_HIEN_TAI_KHONG_BAN_GOI_TRA_PHI_KHONG_CO_DANG_KY")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_4_LUU_TRU_KET_THUC_SU_DUNG")}>
                {t("DU_LIEU_NAM_TREN_THIET_BI_VA_CO_THE_BI_MAT_KHI")}
              </Paragraph>
              <Paragraph title={t("NOI_DUNG_5_PHIEN_BAN_CHINH_THUC")}>
                {t("TRUOC_KHI_CUNG_CAP_DICH_VU_THAT_DON_VI_VAN_HANH_CAN")}
              </Paragraph>
            </>
          )}
        </>
      )}
    </Page>
  );
}
