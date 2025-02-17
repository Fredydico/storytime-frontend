  <script setup lang="ts">
  import { ref } from "vue";
  import axios, { AxiosError } from "axios";
  import { useRouter } from "vue-router"; 
  import  { useAuth }  from "~/store/auth"; 
  import BaseInput from "~/components/input/BaseInput.vue";

  const name = ref("");
  const username = ref("");
  const email = ref("");
  const password = ref("");
  const confirmPassword = ref("");

  const router = useRouter();
  const { setToken, setUser, API_URL } = useAuth(); 

  const register = async () => {
    console.log({
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      confirm_password: confirmPassword.value, 
    });

    if (name.value === "" || username.value === "" || email.value === "" || password.value === "" || confirmPassword.value === "") {
      alert("Please fill in all fields");
      return;
    }

    if (password.value !== confirmPassword.value) {
      alert("Password and confirm password do not match");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        name: name.value,
        username: username.value,
        email: email.value,
        password: password.value,
        confirm_password: confirmPassword.value, 
      });

      const token = response.data.data.token;
      const user = response.data.data.user;

      setToken(token); 
      setUser(user); 

      localStorage.setItem('toastMessage', `You have successfully registered!`);
      router.push("/"); 
    } catch (error) {
      const axiosError = error as AxiosError; 
      console.error("Regis failed:", axiosError.response ? axiosError.response.data : axiosError.message);
      alert("Regis failed. Please check your credentials.");
    }
  };
  </script>

  <template>
    <div class="d-flex">
      <div class="left">
        <NuxtLink to="/">
          <img src="../assets/logo.png" alt="logo" class="logo" />
        </NuxtLink>
        <h1 class="title">Join the World's Most-Loved Social Storytelling Platform!</h1>
        <p class="subtitle">Create an account to explore interesting articles, connect with like-minded people, and share your own stories.</p>
        <img src="../assets/register.png" alt="register image" class="registerImage" />
      </div>
      <div class="right">
        <div class="form">
          <h1 class="titleForm">Create Account</h1>
          <form @submit.prevent="register">
            <div class="input">
              <BaseInput type="text" label="Name" identity="name" placeholder="Enter your name" v-model="name" />
              <BaseInput type="text" label="Username" identity="username" placeholder="Enter your username" v-model="username" />
              <BaseInput type="email" label="Email" identity="email" placeholder="Enter your email" v-model="email" />
              <BaseInput type="password" label="Password" identity="password" placeholder="Enter your chosen password" v-model="password" autocomplete="new-password" />
              <BaseInput type="password" label="Confirm Password" identity="confirmPassword" placeholder="Re-enter your chosen password" v-model="confirmPassword" autocomplete="new-password" />
              <button type="submit" class="btnCreate">Create Account</button>
              <p class="text">Already have an account? <NuxtLink to="/login" class="link">Login</NuxtLink></p>
            </div>
          </form>
        </div>
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
  margin: 40px 0px 0px 60px;
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

.registerImage {
  width: 75%;
  margin: 40px 0px 0px 90px;
}

.right {
  width: 50%;
}

.form {
  margin: 60px 0px 0px 90px;
}

.titleForm {
  font-size: 35px;
  font-weight: bold;
}

.input {
  margin-top: 40px;
}

BaseInput {
  width: 75%;
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
  margin-bottom: 80px;
  font-size: 15px;
}

.link {
  color: #466543;
  font-weight: bold;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .title {
    font-size: 40px;
  }
  
  .subtitle {
    font-size: 20px;
  }
  
  .form {
    margin: 40px 0px 0px 60px;
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
    font-size: 36px;
    margin: 30px 0px 0px 30px;
  }
  
  .subtitle {
    margin: 20px 0px 0px 30px;
    font-size: 18px;
  }
  
  .registerImage {
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
  
  BaseInput {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 28px;
    margin: 20px 0px 0px 20px;
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
  
  .text {
    margin-bottom: 40px;
  }
}
</style>