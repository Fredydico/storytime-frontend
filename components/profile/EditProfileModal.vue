<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">×</button>
      <div class="modalHeader">
        <h2>Edit Profile</h2>
      </div>
      <div class="modal-body">
        <div class="profile-section">
          <div class="profile-picture">
            <img :src="user?.image || defaultAvatar" alt="Avatar" class="avatar" />
            <ButtonLight buttonText="Change Picture" class="btnChangePic" :onClick="triggerFileInput" />
            <input type="file" ref="fileInput" @change="handleFileChange" accept="image/*" style="display: none" />
          </div>
          <BaseInput type="text" label="Name" identity="name" placeholder="Enter your name" width="95%" v-model="user.name" />
          <BaseInput type="email" label="Email" identity="email" placeholder="Enter your email" width="95%" v-model="user.email" :autocomplete="'off'" :disabled="true" />
          <BaseInput type="textarea" label="About Me" identity="aboutMe" placeholder="Tell us about yourself" width="95%" height="90px" v-model="user.aboutme" />
        </div>

        <div class="password-section">
          <h3>Change Password</h3>
          <BaseInput type="password" label="Old Password" identity="oldPassword" placeholder="Enter your old password" width="95%" v-model="oldPassword" />
          <BaseInput type="password" label="New Password" identity="newPassword" placeholder="Enter your new password" width="95%" v-model="newPassword" />
          <BaseInput type="password" label="Confirm New Password" identity="confirmPassword" placeholder="Re-enter your new password" width="95%" v-model="confirmPassword" />
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
        </div>
      </div>

      <div class="button-group">
        <ButtonLight buttonText="Cancel" @click="closeModal" />
        <ButtonSolid buttonText="Update Profile" type="submit" @click="updateProfile" />
      </div>
    </div>
  </div>

  <ModalsToast :message="toastMessage" :type="'success'" v-model:is-visible="showToast" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuth } from "~/store/auth";
import axios, { AxiosError } from "axios";
import BaseInput from "~/components/input/BaseInput.vue";
import ButtonSolid from "~/components/input/ButtonSolid.vue";
import ButtonLight from "../input/ButtonLight.vue";
import defaultAvatar from "~/assets/avatar.png";
import Cookies from "js-cookie";

const { user, API_URL, setUser } = useAuth();

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const uploadedFile = ref<File | null>(null);
const showToast = ref(false);
const toastMessage = ref("");

const closeModal = () => {
  emit("close");
  passwordError.value = "";
};

interface UpdateProfileData {
  name?: string;
  aboutme?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
  image?: string;
}

const validatePasswords = () => {
  if (newPassword.value && !oldPassword.value) {
    passwordError.value = "Please enter your current password";
    return false;
  }

  if (newPassword.value && newPassword.value !== confirmPassword.value) {
    passwordError.value = "New password and confirmation do not match";
    return false;
  }

  passwordError.value = "";
  return true;
};

const updateProfile = async () => {
  if (!validatePasswords()) {
    return;
  }

  const data: UpdateProfileData = {
    name: user.value.name,
    aboutme: user.value.aboutme,
  };

  // Only include password fields if a new password is being set
  if (newPassword.value) {
    data.current_password = oldPassword.value;
    data.new_password = newPassword.value;
    data.new_password_confirmation = confirmPassword.value;
  }

  // Remove empty fields
  Object.keys(data).forEach((key) => {
    if (!data[key as keyof UpdateProfileData]) {
      delete data[key as keyof UpdateProfileData];
    }
  });

  let avatarUrl = null;

  // Handle file upload if there's a new avatar
  if (uploadedFile.value) {
    const formData = new FormData();
    formData.append("files[]", uploadedFile.value);

    const token = Cookies.get("token");
    if (!token) {
      alert("User not logged in");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success && response.data.data.length > 0) {
        avatarUrl = response.data.data;
      } else {
        console.error("Upload failed:", response.data.message);
        alert("Failed to upload avatar. Please try again.");
        return;
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error uploading avatar:", axiosError.response ? axiosError.response.data : axiosError.message);
      alert("Failed to upload avatar. Please try again.");
      return;
    }
  }

  if (avatarUrl) {
    data.image = avatarUrl;
  }

  const token = Cookies.get("token");
  try {
    const response = await axios.put(`${API_URL}/api/users`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      const updatedUser = response.data.data.user;
      setUser({
        ...user.value,
        ...updatedUser,
      });

      // Reset password fields and error message
      oldPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      passwordError.value = "";

      toastMessage.value = "Profile updated successfully!";
      showToast.value = true;
      
      closeModal();
    }
  } catch (error) {
    const axiosError = error as AxiosError<any>;
    console.error("Error updating profile:", axiosError.response?.data);

    if (axiosError.response?.data?.message) {
      // Handle specific error messages from the API
      if (typeof axiosError.response.data.message === "object") {
        // Handle case where message contains multiple validation errors
        const errors = Object.values(axiosError.response.data.message).flat();
        passwordError.value = errors[0] as string;
      } else {
        passwordError.value = axiosError.response.data.message;
      }
    } else {
      passwordError.value = "Failed to update profile. Please check your input.";
    }
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      user.value.image = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    uploadedFile.value = file;
  }
};

// Reset form when modal is opened/closed
watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      oldPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      passwordError.value = "";
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
}

.btnChangePic {
  margin-left: 20px;
}

h2 {
  font-size: 25px;
  font-weight: bold;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  width: 1200px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.disabled {
  background-color: #f0f0f0;
  color: #666;
  cursor: not-allowed;
  border: 1px solid #ccc;
  pointer-events: none;
}

.profile-picture {
  display: flex;
  align-items: center;
}

.change-pic-button {
  margin-left: 25px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.profile-section,
.password-section {
  width: 50%;
}

h3 {
  font-size: 25px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  margin-left: 10px;
  width: 27%;
}

.error-message {
  color: #dc2626;
  margin-top: 8px;
  font-size: 0.875rem;
}
</style>
