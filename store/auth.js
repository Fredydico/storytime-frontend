import { ref } from "vue";
import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const API_URL = "http://159.203.137.163";

const token = ref(Cookies.get(TOKEN_KEY) || null);
const user = ref(Cookies.get(USER_KEY) ? JSON.parse(Cookies.get(USER_KEY)) : null);

const setToken = (newToken) => {
  Cookies.set(TOKEN_KEY, newToken, { expires: 1 });
  token.value = newToken;
};

const setUser = (newUser) => {
  Cookies.set(USER_KEY, JSON.stringify(newUser), { expires: 1 });
  user.value = newUser;
};

const logout = async () => {
  return new Promise((resolve) => {
    try {
      Cookies.remove(TOKEN_KEY);
      Cookies.remove(USER_KEY);
      token.value = null;
      user.value = null;
      resolve();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  });
};

const isAuthenticated = () => {
  return token.value !== null && token.value !== "";
};

export const useAuth = () => {
  return {
    token,
    user,
    API_URL,
    setToken,
    setUser,
    logout,
    isAuthenticated,
  };
};