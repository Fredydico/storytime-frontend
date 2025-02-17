<template>
    <button class="pagNext">{{ buttonText }}</button>
</template>

<script setup>
defineProps({
    buttonText: {type: String}
})
</script>

<style>
.pagNext{
    width: 100px;
    height: 55px;
    background-color: white;
    border-radius: 8px;
    border: none;
    font-size: 25px;
    font-weight: 600;
    color: black;
    margin: 10px 10px 10px 10px;
    transition: 0.3s ease
}

.pagNext:hover{
    background-color: #466543;
    color: white;
}
</style>