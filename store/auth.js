import { ref } from "vue";
import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const API_URL = "http://157.245.193.94";

// Helper function to safely parse JSON
const safeJSONParse = (str) => {
  try {
    return str ? JSON.parse(str) : null;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
};

// Initialize token and user from cookies
const token = ref(Cookies.get(TOKEN_KEY) || null);
const user = ref(safeJSONParse(Cookies.get(USER_KEY)));

const setToken = (newToken) => {
  if (newToken) {
    Cookies.set(TOKEN_KEY, newToken, { expires: 1 });
    token.value = newToken;
  } else {
    Cookies.remove(TOKEN_KEY);
    token.value = null;
  }
};

const setUser = (newUser) => {
  if (newUser) {
    // Ensure we're storing a clean object without any Vue reactivity
    const userToStore = JSON.parse(JSON.stringify(newUser));
    Cookies.set(USER_KEY, JSON.stringify(userToStore), { expires: 1 });
    user.value = userToStore;
  } else {
    Cookies.remove(USER_KEY);
    user.value = null;
  }
};

const fetchCurrentUser = async () => {
  try {
    if (!token.value) return null;

    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const userData = await response.json();
    setUser(userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

const updateProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const updatedUser = await response.json();
    setUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

const logout = async () => {
  return new Promise((resolve) => {
    try {
      setToken(null);
      setUser(null);
      resolve();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  });
};

const isAuthenticated = () => {
  return Boolean(token.value);
};

export const useAuth = () => {
  return {
    token,
    user,
    API_URL,
    setToken,
    setUser,
    updateProfile,
    fetchCurrentUser,
    logout,
    isAuthenticated,
  };
};  