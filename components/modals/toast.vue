<template>
  <Transition name="toast">
    <div v-if="isVisible" class="modal-toast" :class="type">
      <div class="modal-content">
        <div class="modal-header">
          <img v-if="type === 'success'" src="../../assets/iconSuccess.png" alt="success" class="modal-icon" />
          <p class="modal-message">{{ message }}</p>
          <button class="modal-close" @click="close">×</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps<{
  message: string;
  duration?: number;
  type?: "success" | "error";
  isVisible: boolean;
}>();

const emit = defineEmits(["update:isVisible"]);

const close = () => {
  emit("update:isVisible", false);
};

let timeoutId: number | null = null;

const startTimer = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = window.setTimeout(() => {
    close();
  }, props.duration || 4000);
};

watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      startTimer();
    }
  }
);

watch(
  () => props.message,
  () => {
    if (props.isVisible) {
      startTimer();
    }
  }
);

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.modal-toast {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  width: auto;
  max-width: calc(100% - 32px);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.modal-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.modal-close:hover {
  color: #333;
}

.modal-message {
  color: #1a1a1a;
  font-size: 16px;
  margin: 0 16px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.success {
  border-top: 4px solid #466543;
}

.error {
  border-top: 4px solid #ef4444;
}

/* Animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .modal-toast {
    max-width: calc(100% - 24px);
  }

  .modal-header {
    padding: 10px 14px;
  }

  .modal-message {
    font-size: 14px;
    margin: 0 12px;
  }

  .modal-icon {
    width: 20px;
    height: 20px;
  }

  .modal-close {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .modal-toast {
    max-width: calc(100% - 16px);
  }

  .modal-header {
    padding: 8px 12px;
  }

  .modal-message {
    font-size: 13px;
    margin: 0 8px;
  }

  .modal-icon {
    width: 18px;
    height: 18px;
  }

  .modal-close {
    font-size: 18px;
  }
}
</style>