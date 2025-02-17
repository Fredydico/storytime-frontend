<template>
  <header class="sticky-header">
    <div class="contentHeader">
      <NuxtLink to="/" class="logo-container">
        <img src="~/assets/logo.png" alt="Logo" class="logo" />
      </NuxtLink>
      <div class="user-section">
        <template v-if="isAuthenticated()">
          <div class="user-menu" @click="toggleDropdown">
            <div class="user-info">
              <img :src="user?.image || defaultAvatar" alt="Avatar" class="avatar" />
              <span class="username">{{ user ? user.name : "User" }}</span>
              <i class="fa-solid fa-caret-down"></i>
            </div>
            <div class="dropdown-content" :class="{ show: isDropdownOpen }">
              <NuxtLink to="/userProfile">My Profile</NuxtLink>
              <a href="#" @click.prevent="handleLogout">Logout</a>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <InputButtonLight buttonText="Register" routeTo="/register"></InputButtonLight>
            <InputButtonSolid buttonText="Login" routeTo="/login"></InputButtonSolid>
          </div>
        </template>
      </div>
    </div>

    <Modal :is-open="showLogoutModal" title="Logout" message="Are you sure want to logout?" confirm-text="Logout" cancel-text="Cancel" :on-confirm="confirmLogout" :on-cancel="() => (showLogoutModal = false)" />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/store/auth";
import defaultAvatar from "~/assets/avatar.png";
import Modal from "~/components/modals/modal.vue";

const router = useRouter();
const { user, isAuthenticated, logout } = useAuth();
const showLogoutModal = ref(false);
const isDropdownOpen = ref(false);

const toggleDropdown = (event: Event) => {
  event.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = (event: Event) => {
  if (!event.target || !(event.target as Element).closest(".user-menu")) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
});

const handleLogout = () => {
  showLogoutModal.value = true;
};

const confirmLogout = async () => {
  try {
    console.log("Logging out...");
    await logout();
    console.log("Logout successful");
    showLogoutModal.value = false;
    router.push("/");
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Failed to logout. Please try again.");
  }
};
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgb(198, 198, 198);
}

.contentHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1440px;
  height: 80px;
  margin: 0 auto;
  padding: 0px 55px;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
}

.logo {
  height: 100%;
  width: 180px;
  object-fit: contain;
}

.user-section {
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f5f5;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-weight: bold;
  font-size: 20px;
  margin-right: 5px;
}

.fa-solid {
  color: #666;
  margin-top: 4px;
  font-size: 18px;
  transition: transform 0.2s;
}

.user-menu:has(.show) .fa-solid {
  transform: rotate(180deg);
}

.dropdown-content {
  display: none;
  position: absolute;
  border-radius: 13px;
  top: 60px;
  right: 3px;
  width: 50px;
  align-items: center;
  background-color: white;
  min-width: 120px;
  z-index: 1000;
  box-shadow: 0px 8px 8px 0px rgba(0, 0, 0, 0.2);
}

.dropdown-content.show {
  display: block;
}

.dropdown-content a,
.dropdown-content button {
  color: black;
  background-color: white;
  padding: 10px 0px 10px 10px;
  border-radius: 10px;
  width: 100%;
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  display: block;
  text-align: left;
  transition: 0.3s ease;
}
.dropdown-content a:hover,
.dropdown-content button:hover {
  background-color: #f1f1f1;
  color: #466543;
}

.dropdown-content a:hover {
  background-color: #f5f5f5;
  color: #466543;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .contentHeader {
    padding: 0.5rem 1rem;
  }

  .logo {
    height: 45px;
  }

  .username {
    display: none;
  }

  .auth-buttons {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .contentHeader {
    padding: 0.5rem;
  }

  .logo {
    height: 35px;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }

  .dropdown-content {
    right: -1rem;
  }
}
</style>
