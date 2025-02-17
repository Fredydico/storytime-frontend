<template>
  <div class="card" @click="selectCategory">
    <h2>{{ categories }}</h2>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  categories: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["categorySelected"]);

const selectCategory = () => {
  emit("categorySelected", props.categories);
};
</script>

<style scoped>
.card {
  width: auto;
  height: 100px;
  padding: 0px 40px;
  margin: 10px 20px 10px 0px;
  border-radius: 5px;
  text-align: center;
  justify-content: center;
  border: none;
  color: #466543;
  transition: background-color 0.3s ease, color 0.3s ease;
  z-index: 0;
  position: relative;
}

.card:hover {
  cursor: pointer;
  background-color: #d4f5d1;
}

.card:hover h2 {
  color: black;
  z-index: 1;
}
</style>
