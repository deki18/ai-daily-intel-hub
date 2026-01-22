import { useState, useEffect, useCallback } from 'react';
import en from './en.json';
import zh from './zh.json';

// 定义支持的语言类型
export type Language = 'en' | 'zh';

// 定义语言包类型
export type Translations = typeof en;

// 语言包映射
const translations: Record<Language, Translations> = {
  en,
  zh,
};

// 获取用户本地存储的语言偏好
export const getStoredLanguage = (): Language | null => {
  try {
    const storedLang = localStorage.getItem('language');
    return storedLang as Language | null;
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
    return null;
  }
};

// 保存语言偏好到本地存储
export const saveLanguageToStorage = (language: Language): void => {
  try {
    localStorage.setItem('language', language);
  } catch (error) {
    console.error('Error saving language to localStorage:', error);
  }
};

// 检测用户IP所属地区
export const detectUserRegion = async (): Promise<'CN' | 'OTHER'> => {
  try {
    // 使用第三方IP检测API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country === 'CN' ? 'CN' : 'OTHER';
  } catch (error) {
    console.error('Error detecting user region:', error);
    // 失败时默认返回OTHER
    return 'OTHER';
  }
};

// 根据地区获取默认语言
export const getDefaultLanguageByRegion = (region: 'CN' | 'OTHER'): Language => {
  return region === 'CN' ? 'zh' : 'en';
};

// 翻译函数
export const t = (key: string, language: Language, params?: Record<string, string | number>): string => {
  // 将key分割为路径数组
  const keys = key.split('.');
  let value: any = translations[language];

  // 遍历路径获取对应的值
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // 如果key不存在，返回原key
    }
  }

  // 如果是字符串类型，处理参数替换
  if (typeof value === 'string' && params) {
    return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
      return result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    }, value);
  }

  return typeof value === 'string' ? value : key;
};

// 语言管理Hook
export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isDetecting, setIsDetecting] = useState(true);

  // 初始化语言
  useEffect(() => {
    const initLanguage = async () => {
      // 优先使用本地存储的语言
      const storedLang = getStoredLanguage();
      if (storedLang) {
        setLanguage(storedLang);
        setIsDetecting(false);
        return;
      }

      // 检测用户地区并设置默认语言
      const region = await detectUserRegion();
      const defaultLang = getDefaultLanguageByRegion(region);
      setLanguage(defaultLang);
      saveLanguageToStorage(defaultLang);
      setIsDetecting(false);
    };

    initLanguage();
  }, []);

  // 切换语言
  const switchLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    saveLanguageToStorage(newLanguage);
  }, []);

  return {
    language,
    switchLanguage,
    isDetecting,
    t: (key: string, params?: Record<string, string | number>) => t(key, language, params),
  };
};
