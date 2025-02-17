<template>
  <div class="titles">
    <h1 class="title">{{ titleText }}</h1>
    <div class="containerArrow d-flex align-items-center" v-if="exploreMore" @click="navigateToAllStories">
      <p class="line">Explore More</p>
      <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" class="arrow">
        <path fill="currentColor" d="M4 12h12.25L11 6.75l.66-.75l6.5 6.5l-6.5 6.5l-.66-.75L16.25 13H4z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  titleText: string;
  exploreMore: boolean;
}>();

const router = useRouter();

const navigateToAllStories = () => {
  router.push({ 
    name: 'allStory', 
    query: { 
      category: props.titleText && props.titleText !== 'Latest Stories' ? props.titleText : '' 
    } 
  });
};
</script>

<style scoped>
.titles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0px;
  margin: 0px 90px;
  border-bottom: 1px solid rgb(198, 198, 198);
}

.containerArrow {
  cursor: pointer;
  display: flex;
  position: relative;
  padding-top: 10px;
}

.containerArrow::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5px;
  height: 1.4px;
  width: 95%;
  background-color: transparent;
  transition: background-color 0.3s;
}

.containerArrow:hover::after {
  background-color: #466543;
}

.containerArrow:hover .arrow, 
.containerArrow:hover .line {
  color: #466543;
}

.title {
  font-family: "Playfair", serif;
  font-weight: bolder;
  font-size: 40px;
}

.line {
  font-size: 20px;
  margin-right: 5px;
}

.arrow {
  margin-bottom: 8px;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .titles {
    margin: 0px 40px;
  }

  .title {
    font-size: 36px;
  }

  .line {
    font-size: 18px;
  }

  .arrow {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 768px) {
  .titles {
    margin: 0px 20px;
  }

  .title {
    font-size: 32px;
  }

  .line {
    font-size: 16px;
  }

  .arrow {
    width: 25px;
    height: 25px;
  }
}

@media (max-width: 480px) {
  .titles {
    margin: 0px 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .title {
    font-size: 28px;
  }

  .containerArrow {
    padding-top: 0;
  }

  .line {
    font-size: 14px;
  }

  .arrow {
    width: 20px;
    height: 20px;
    margin-bottom: 4px;
  }
}
</style>