<template>
    <button class="pagNum">{{ buttonText }}</button>
</template>

<script setup>
const props = defineProps({
    buttonText: {
        type: String,
        required: true
    }
});
</script>

<style>
.pagNum {
    width: auto;
    padding: 0px 20px;
    height: 55px;
    background-color: #466543;
    border-radius: 8px;
    border: none;
    font-size: 25px;
    font-weight: 600;
    color: white;
    margin: 10px;
    transition: 0.3s ease;
}

.pagNum:hover {
    background-color: #2a3d29;
}
</style>
