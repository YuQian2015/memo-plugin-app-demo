export * from './time'
import lang from "../../../main/i18n.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 全局设置对象
export const settings = {
  language: "zh",
}

// 语言初始化函数
export async function initI18n(): Promise<void> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const locales = await (window.AIM as any).locales.getLanguage();

        settings.language = locales.currentLanguage;
        console.log(settings);
        console.log(locales);

        (window as any)._locales = locales;
        (window as any)._language = locales.allLanguagesInfo?.[settings.language]?.localeName || "简体中文";

        const resources = JSON.parse(JSON.stringify(lang || {}));

        for (const key in resources) {
          if (Object.prototype.hasOwnProperty.call(resources, key)) {
            resources[key] = { translation: resources[key as keyof typeof resources] };
          }
        }

        const defaultLang = settings.language || "en";
        await i18n
          .use(initReactI18next) // passes i18n down to react-i18next
          .init({
            // the translations
            // (tip move them in a JSON file and import them,
            // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
            resources,
            lng: defaultLang, // if you're using a language detector, do not define the lng option
            fallbackLng: "en",
            interpolation: {
              escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
            }
          }, () => {
            console.log("i18n init success");
            resolve();
          });
      } catch (error) {
        console.error("i18n init failed:", error);
        reject(error);
      }
    })();
  });
}