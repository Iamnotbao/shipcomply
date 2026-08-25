import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from '../src/locales/vi.json'
import en from '../src/locales/en.json'
import zh from '../src/locales/zh.json'

i18n
.use(initReactI18next)
.init({
    resources:{
        vi:{translation :vi},
        en:{translation:en},
        zh:{ translation: zh },
    },
    lng:'en',
    fallbackLng:'en',
    interpolation:{escapeValue: false}
})
export default i18n;