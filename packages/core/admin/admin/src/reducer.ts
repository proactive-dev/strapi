import { createSlice } from '@reduxjs/toolkit';

import { PermissionMap } from './types/permissions';
import { getCookieValue, setCookie, deleteCookie } from './utils/cookies';

import type { PayloadAction } from '@reduxjs/toolkit';
import { User } from "./features/Auth";

type ThemeName = 'light' | 'dark' | 'system';

interface AppState {
  language: {
    locale: string;
    localeNames: Record<string, string>;
  };
  permissions: Partial<PermissionMap>;
  theme: {
    currentTheme: ThemeName;
    availableThemes: string[];
  };
  token?: string | null;
}

const STORAGE_KEYS = {
  TOKEN: 'jwtToken',
  STATUS: 'isLoggedIn',
  USER: 'userInfo',
};

const THEME_LOCAL_STORAGE_KEY = 'STRAPI_THEME';
const LANGUAGE_LOCAL_STORAGE_KEY = 'strapi-admin-language';

export const getStoredToken = (): string | null => {
  const fromLocalStorage = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (fromLocalStorage) {
    return JSON.parse(fromLocalStorage);
  }

  const fromCookie = getCookieValue(STORAGE_KEYS.TOKEN);
  return fromCookie ?? null;
};

const adminSlice = createSlice({
  name: 'admin',
  initialState: () => {
    return {
      language: {
        locale: 'en',
        localeNames: { en: 'English' },
      },
      permissions: {},
      theme: {
        availableThemes: [],
        currentTheme: localStorage.getItem(THEME_LOCAL_STORAGE_KEY) || 'system',
      },
      token: null,
    } as AppState;
  },
  reducers: {
    setAppTheme(state, action: PayloadAction<ThemeName>) {
      state.theme.currentTheme = action.payload;
      window.localStorage.setItem(THEME_LOCAL_STORAGE_KEY, action.payload);
    },
    setAvailableThemes(state, action: PayloadAction<AppState['theme']['availableThemes']>) {
      state.theme.availableThemes = action.payload;
    },
    setLocale(state, action: PayloadAction<string>) {
      state.language.locale = action.payload;

      window.localStorage.setItem(LANGUAGE_LOCAL_STORAGE_KEY, action.payload);
      document.documentElement.setAttribute('lang', action.payload);
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    login(state, action: PayloadAction<{ token: string; user?: User; persist?: boolean }>) {
      const { token, user, persist } = action.payload;

      window.localStorage.setItem(STORAGE_KEYS.TOKEN, JSON.stringify(token));
      if (persist) {
        if (!!user) {
          window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }
      } else {
        setCookie(STORAGE_KEYS.TOKEN, token);
        if (!!user) {
          setCookie(STORAGE_KEYS.USER, JSON.stringify(user));
        }
      }
      window.localStorage.setItem(STORAGE_KEYS.STATUS, 'true');
      state.token = token;
    },
    logout(state) {
      state.token = null;
      deleteCookie(STORAGE_KEYS.TOKEN);
      deleteCookie(STORAGE_KEYS.USER);
      window.localStorage.removeItem(STORAGE_KEYS.TOKEN);
      window.localStorage.removeItem(STORAGE_KEYS.USER);
      window.localStorage.removeItem(STORAGE_KEYS.STATUS);
    },
  },
});

const reducer = adminSlice.reducer;

export const { setAppTheme, setAvailableThemes, setLocale, setToken, logout, login } =
  adminSlice.actions;

export { reducer, THEME_LOCAL_STORAGE_KEY, LANGUAGE_LOCAL_STORAGE_KEY };
export type { AppState, ThemeName };
