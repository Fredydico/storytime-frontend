<template>  
  <button class="btnLight" @click="handleClick">{{ buttonText }}</button>  
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
  // Jika onClick ada, panggil fungsi tersebut  
  if (props.onClick) {  
    props.onClick();  
  } else if (props.routeTo) {  
    // Jika tidak ada onClick, arahkan ke routeTo  
    router.push(props.routeTo);  
  }  
};  
</script>  
  
<style scoped>  
.btnLight {  
  margin-right: 25px;  
  width: auto;  
  padding: 0px 20px;  
  height: 50px;  
  border: 2px solid #466543;  
  border-radius: 8px;  
  font-size: 20px;  
  color: #466543;  
  transition: 0.3s ease;  
}  
  
.btnLight:hover {  
  border: 2px solid black;  
  color: black;  
}  
</style>  
