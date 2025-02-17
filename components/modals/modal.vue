<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-buttons">
          <ButtonLight 
            :button-text="cancelText" 
            :on-click="onCancel"
          />
          <ButtonSolid 
            :button-text="confirmText" 
            :on-click="onConfirm"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import ButtonLight from '../input/ButtonLight.vue';
import ButtonSolid from '../input/ButtonSolid.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  onConfirm: {
    type: Function,
    required: true
  },
  onCancel: {
    type: Function,
    required: true
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  }
});

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    props.onCancel();
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 1rem;
  color: #000;
  text-align: center;
}

.modal-message {
  font-size: 16px;
  margin-bottom: 2rem;
  color: #666;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 24px;
  }

  .modal-message {
    font-size: 15px;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-message {
    font-size: 14px;
    margin-bottom: 1.25rem;
  }

  .modal-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>