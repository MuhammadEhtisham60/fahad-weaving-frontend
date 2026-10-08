import { createSlice } from "@reduxjs/toolkit";

// ---------- helpers ----------
function loadTokens() {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("access_token") || null,
    refreshToken: localStorage.getItem("refresh_token") || null,
  };
}

function loadUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ---------- initial state ----------
const initialState = {
  ...loadTokens(),
  user: loadUser(),
  isAuthenticated: !!loadTokens().accessToken,
};

// ---------- slice ----------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Called after a successful POST /auth/login/
     * payload = { tokens: { access, refresh }, user: { ... } }
     */
    setCredentials(state, action) {
      const { tokens, user } = action.payload;
      state.accessToken = tokens.access;
      state.refreshToken = tokens.refresh;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("auth_user", JSON.stringify(user));
      // Keep backward-compat flag for the root guard
      localStorage.setItem("forge-authenticated", "true");
    },

    /**
     * Called when the reauth interceptor successfully refreshes the token.
     * payload = newAccessToken (string)
     */
    tokenRefreshed(state, action) {
      state.accessToken = action.payload;
      localStorage.setItem("access_token", action.payload);
    },

    /**
     * Update the stored user profile (e.g. after GET /auth/me/)
     */
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem("auth_user", JSON.stringify(action.payload));
    },

    /**
     * Clear everything — redirect handled by the component / root guard.
     */
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("forge-authenticated");
    },
  },
});

export const { setCredentials, tokenRefreshed, setUser, logout } = authSlice.actions;

// ---------- selectors ----------
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
