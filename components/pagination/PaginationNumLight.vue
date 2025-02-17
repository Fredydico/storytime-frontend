<template>
    <button 
        class="pagNumLight" 
        :class="{ 'disabled': disabled }" 
        :disabled="disabled" 
        @click="onClick"
    >
        {{ buttonText }}
    </button>
</template>

<script setup>
const props = defineProps({
    buttonText: {
        type: String,
        required: true
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['click']);

const onClick = () => {
    if (!props.disabled) {
        emit('click');
    }
};
</script>

<style>
.pagNumLight {
    width: auto;
    padding: 0px 20px;
    height: 55px;
    background-color: white;
    border-radius: 8px;
    border: none;
    font-size: 25px;
    font-weight: 600;
    color: black;
    margin: 10px;
    transition: 0.3s ease;
    cursor: pointer;
}

.pagNumLight:hover {
    background-color: #466543;
    color: white;
}

.pagNumLight.disabled {
    opacity: 0.5; 
    cursor: not-allowed;
}
</style>
