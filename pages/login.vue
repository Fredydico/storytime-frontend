<script setup lang="ts">
import { ref } from "vue";
import axios, { AxiosError } from "axios";
import BaseInput from "~/components/input/BaseInput.vue";
import { useRouter } from "vue-router";
import { useAuth } from "~/store/auth";

const username = ref("");
const password = ref("");
const router = useRouter();
const { setToken, setUser, API_URL } = useAuth();

const login = async () => {
  if (username.value === "" || password.value === "") {
    alert("Please fill in all fields");
    return;
  }
  try {
    const response = await axios.post(`${API_URL}/api/login`, {
      email: username.value,
      password: password.value,
    });

    console.log("Full response:", response.data);

    const token = response.data.data.token;
    let user = response.data.data.user;

    const apiBaseUrl = `${API_URL}`;
    if (user.image) {
      if (typeof user.image === "string" && user.image.trim() !== "") {
        user.image = user.image.replace(/^(.*?)(\/storage.*)$/, `${apiBaseUrl}$2`);
      } else {
        console.error("User image is not a valid string:", user.image);
      }
    }

    console.log("Updated image URL:", user.image);

    setToken(token);
    setUser(user);

    // Store the toast message in localStorage before navigation
    localStorage.setItem('toastMessage', `You have successfully logged in!`);
    
    router.push("/");

  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Login failed:", axiosError.response ? axiosError.response.data : axiosError.message);
    alert("Login failed. Please check your credentials.");
  }
};
</script>

<template>
  <div class="d-flex">
    <div class="right">
      <NuxtLink to="/">
        <img src="../assets/logo.png" alt="logo" class="logo" />
      </NuxtLink>
      <div class="form">
        <h1 class="titleForm">Login</h1>
        <form @submit.prevent="login">
          <div class="input">
            <BaseInput type="text" label="Username/Email" identity="email" placeholder="Enter your username or email" v-model="username" />
            <BaseInput type="password" label="Password" identity="password" placeholder="Enter your chosen password" v-model="password" />
            <button type="submit" class="btnCreate">Login</button>
            <p class="text">Don't have an account? <NuxtLink to="/register" class="link">Register</NuxtLink></p>
          </div>
        </form>
      </div>
    </div>
    <div class="left">
      <h1 class="title">Welcome Back to Story Time!</h1>
      <p class="subtitle">Dive back into captivating stories, follow your favorite authors, and continue sharing your own tales.</p>
      <img src="../assets/login.png" alt="login image" class="loginImage" />
    </div>
  </div>
</template>

<style scoped>
.d-flex {
  display: flex;
}

.left {
  width: 50%;
}

.logo {
  width: 200px;
  margin: 40px 0px 0px 60px;
}

.title {
  font-family: "Playfair", serif;
  width: 50%;
  margin: 80px 0px 0px 60px;
  font-size: 50px;
  font-weight: bolder;
}

.subtitle {
  margin: 20px 0px 0px 60px;
  font-size: 23px;
  width: 85%;
  align-content: center;
  color: rgb(66, 66, 66);
}

.loginImage {
  width: 75%;
  margin: 40px 0px 0px -40px;
}

.right {
  width: 50%;
}

.form {
  margin: 120px 0px 0px 120px;
}

.titleForm {
  font-size: 35px;
  font-weight: bold;
}

.input {
  margin-top: 40px;
}

.btnCreate {
  width: 200px;
  height: 50px;
  background-color: #466543;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 20px;
  cursor: pointer;
  margin-top: 10px;
}

.btnCreate:hover {
  background-color: #3b5a3e;
}

.text {
  margin-top: 30px;
  font-size: 15px;
}

.link {
  color: #466543;
  font-weight: bold;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .title {
    width: 70%;
    font-size: 40px;
  }
  
  .subtitle {
    font-size: 20px;
  }
  
  .form {
    margin: 100px 0px 0px 60px;
  }
}

@media (max-width: 768px) {
  .d-flex {
    flex-direction: column;
  }
  
  .left, .right {
    width: 100%;
  }
  
  .title {
    width: 80%;
    font-size: 36px;
    margin: 40px 0px 0px 30px;
  }
  
  .subtitle {
    margin: 20px 0px 0px 30px;
    font-size: 18px;
  }
  
  .loginImage {
    width: 90%;
    margin: 30px auto;
    display: block;
  }
  
  .form {
    margin: 40px 30px;
  }
  
  .logo {
    margin: 20px 0px 0px 30px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 28px;
    width: 90%;
    margin: 30px 0px 0px 20px;
  }
  
  .subtitle {
    margin: 15px 0px 0px 20px;
    font-size: 16px;
    width: 90%;
  }
  
  .logo {
    width: 150px;
    margin: 20px 0px 0px 20px;
  }
  
  .form {
    margin: 30px 20px;
  }
  
  .titleForm {
    font-size: 28px;
  }
  
  .btnCreate {
    width: 100%;
    font-size: 18px;
  }
}
</style>