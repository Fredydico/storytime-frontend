<template>
  <footer class="footer">
    <h2>&copy; 2024 PT. Timedoor Indonesia. All rights reserved.</h2>
    <div class="social-icons">
      <svg xmlns="http://www.w3.org/2000/svg" width="35" viewBox="0 0 24 24" class="icon">
        <path
          fill="currentColor"
          d="M20.9 2H3.1A1.1 1.1 0 0 0 2 3.1v17.8A1.1 1.1 0 0 0 3.1 22h9.58v-7.75h-2.6v-3h2.6V9a3.64 3.64 0 0 1 3.88-4a20 20 0 0 1 2.33.12v2.7H17.3c-1.26 0-1.5.6-1.5 1.47v1.93h3l-.39 3H15.8V22h5.1a1.1 1.1 0 0 0 1.1-1.1V3.1A1.1 1.1 0 0 0 20.9 2"
        />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="38" viewBox="0 0 24 24" class="icon">
        <path fill="currentColor" d="M12 8.75a3.25 3.25 0 1 0 0 6.5a3.25 3.25 0 0 0 0-6.5" />
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M6.77 3.082a47.5 47.5 0 0 1 10.46 0c1.899.212 3.43 1.707 3.653 3.613a45.7 45.7 0 0 1 0 10.61c-.223 1.906-1.754 3.401-3.652 3.614a47.5 47.5 0 0 1-10.461 0c-1.899-.213-3.43-1.708-3.653-3.613a45.7 45.7 0 0 1 0-10.611C3.34 4.789 4.871 3.294 6.77 3.082M17 6a1 1 0 1 0 0 2a1 1 0 0 0 0-2m-9.75 6a4.75 4.75 0 1 1 9.5 0a4.75 4.75 0 0 1-9.5 0"
          clip-rule="evenodd"
        />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="40" viewBox="0 0 24 24" class="icon">
        <path
          fill="currentColor"
          d="M12.244 4c.534.003 1.87.016 3.29.073l.504.022c1.429.067 2.857.183 3.566.38c.945.266 1.687 1.04 1.938 2.022c.4 1.56.45 4.602.456 5.339l.001.152v.174c-.007.737-.057 3.78-.457 5.339c-.254.985-.997 1.76-1.938 2.022c-.709.197-2.137.313-3.566.38l-.504.023c-1.42.056-2.756.07-3.29.072l-.235.001h-.255c-1.13-.007-5.856-.058-7.36-.476c-.944-.266-1.687-1.04-1.938-2.022c-.4-1.56-.45-4.602-.456-5.339v-.326c.006-.737.056-3.78.456-5.339c.254-.985.997-1.76 1.939-2.021c1.503-.419 6.23-.47 7.36-.476zM9.999 8.5v7l6-3.5z"
        />
      </svg>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.footer {
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 90px;
  background-color: #f8f8f8;
  border-top: 1px solid #ccc;
}

.footer h2 {
  margin: 0;
  font-size: 17px;
  color: #666;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.icon {
  text-decoration: none;
  color: black; 
  transition: 0.3s ease;
}

.icon:hover {
  color: #466543; 
}

/* Responsive Styles */
@media (max-width: 768px) {
  .footer {
    flex-direction: column;
    text-align: center;
    padding: 20px;
    gap: 15px;
  }

  .footer h2 {
    font-size: 14px;
  }

  .social-icons {
    justify-content: center;
  }

  .icon {
    width: 30px;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 15px;
  }

  .footer h2 {
    font-size: 12px;
  }

  .icon {
    width: 25px;
  }
}
</style>