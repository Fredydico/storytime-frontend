<template>
  <button class="btnSolid" @click="handleClick">{{ buttonText }}</button>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  buttonText: {
    type: String,
    required: true,
  },
  routeTo: {
    type: String,
    required: false,
  },
  onClick: {
    type: Function,
    required: false,
  },
});

const router = useRouter();

const handleClick = () => {
  if (props.onClick) {
    props.onClick();
  } else if (props.routeTo) {
    router.push(props.routeTo);
  }
};
</script>

<style scoped>
.btnSolid {
  margin-right: 10px;
  width: auto;
  padding: 0px 20px;
  height: 50px;
  border: 1px solid #466543;
  background-color: #466543;
  border-radius: 8px;
  font-size: 20px;
  color: white;
  transition: 0.3s ease;
}

.btnSolid:hover {
  border: 1px solid #2a3d29;
  background-color: #2a3d29;
}
</style>