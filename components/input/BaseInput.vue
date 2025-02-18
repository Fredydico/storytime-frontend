<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  type: { type: String, required: true },
  label: { type: String, required: true },
  identity: { type: String, required: true },
  placeholder: { type: String, required: true },
  modelValue: { type: [String, Number, Object], default: "" },
  autocomplete: { type: String, default: "" },
  width: { type: String, default: "75%" },
  height: { type: String, default: "60px" },
  isToolbar: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  isImage: { type: Boolean, default: false },
  isDropdown: { type: Boolean, default: false },
  dropdownOptions: { type: Array, default: () => [] },
  multiple: { type: Boolean, default: false },
  previewImages: { type: Array, default: () => [] },
  maxFiles: { type: Number, default: 1 },
  minFiles: { type: Number, default: 0 },
});

const emit = defineEmits(["update:modelValue", "file-selected", "remove-image"]);

const updateValue = (event) => {
  const target = event.target;
  if (props.isDropdown) {
    const selectedValue = target.value;
    emit("update:modelValue", selectedValue);
  } else {
    emit("update:modelValue", target.value);
  }
};

const isTextarea = props.type === "textarea";
const inputWidth = props.width;
const inputHeight = props.height;

const fileInput = ref(null);

const canAddMoreFiles = computed(() => {
  return !props.previewImages || props.previewImages.length < props.maxFiles;
});

const triggerFileInput = () => {
  if (fileInput.value && canAddMoreFiles.value) {
    fileInput.value.click();
  }
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    emit("file-selected", files);
    event.target.value = ''; // Reset input
  }
};

const removeImage = (index) => {
  emit("remove-image", index);
};
</script>

<template>
  <div class="inputWrapper">
    <label :for="identity" class="label">
      {{ label }}
      <span v-if="isImage && minFiles > 0" class="required-text">
        (Minimum {{ minFiles }} {{ minFiles === 1 ? 'image' : 'images' }} required)
      </span>
    </label>
    <div class="inputContainer" :style="{ width: inputWidth }">
      <div v-if="isToolbar" class="toolbar">
        <select class="toolbar-button" name="textType" id="">
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <button class="toolbar-button"><i class="fa-solid fa-bold"></i></button>
        <button class="toolbar-button"><i class="fa-solid fa-italic"></i></button>
        <button class="toolbar-button"><i class="fa-solid fa-underline"></i></button>
        <button class="toolbar-button"><i class="fa-solid fa-link"></i></button>
        <button class="toolbar-button"><i class="fa-solid fa-list"></i></button>
        <button class="toolbar-button"><i class="fa-solid fa-list-ol"></i></button>
        <button class="toolbar-button"><i class="fa-solid fa-subscript"></i></button>
      </div>
      
      <div v-if="isImage" class="image-upload-container">
        <input 
          type="file" 
          @change="handleFileChange" 
          accept="image/*" 
          ref="fileInput" 
          class="inputImage" 
          :multiple="multiple"
          hidden 
        />
        
        <div v-if="previewImages && previewImages.length > 0" class="preview-grid">
          <div v-for="(preview, index) in previewImages" :key="index" class="preview-item">
            <img :src="preview" :alt="`Preview ${index + 1}`" class="preview-image" />
            <div class="preview-overlay">
              <button class="remove-btn" @click.stop="removeImage(index)">
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
          </div>
          <div 
            v-if="canAddMoreFiles" 
            class="add-more" 
            @click.stop="triggerFileInput"
          >
            <i class="fa-solid fa-plus"></i>
            <span>Add More</span>
          </div>
        </div>
        
        <div 
          v-else 
          class="upload-box" 
          @click="triggerFileInput"
        >
          <div class="upload-content">
            <div class="upload-icon">
              <i class="fa-solid fa-image"></i>
            </div>
            <span class="upload-text">{{ placeholder }}</span>
          </div>
        </div>
      </div>

      <select
        v-else-if="isDropdown"
        :value="modelValue"
        class="formControl dropdown"
        :style="{ height: inputHeight }"
        @change="updateValue"
        :disabled="disabled"
      >
        <option value="" disabled selected>{{ placeholder }}</option>
        <option 
          v-for="option in dropdownOptions" 
          :key="option.id" 
          :value="option.id"
        >
          {{ option.name }}
        </option>
      </select>

      <component
        v-else
        :is="isTextarea ? 'textarea' : 'input'"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        class="formControl"
        :style="{ height: inputHeight }"
        :autocomplete="autocomplete"
        @input="updateValue"
        :rows="isTextarea ? 5 : undefined"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<style scoped>
.inputWrapper {
  margin-bottom: 17px;
  display: flex;
  flex-direction: column;
}

.inputWrapper:hover {
  border-color: #466543;
  background: #f0f5ed;
}

.inputContainer {
  display: flex;
  flex-direction: column;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  background-color: #f1f1f1;
  padding: 10px 10px 10px 4px;
  width: 25%;
}

.toolbar-button {
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
}

.formControl {
  border: none;
  padding: 0.375rem 0.75rem;
  font-size: 16px;
  resize: none;
  outline: none;
  width: 100%;
}

.formControl:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.label {
  font-size: 15px;
  margin-bottom: 10px;
}

.required-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.image-upload-container {
  min-height: 200px;
  padding: 20px;
  width: 100%;
}

.upload-box {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  min-height: 200px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-box:hover {
  border-color: #466543;
  background: #f0f5ed;
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #466543;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 16px;
  color: #666;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 10px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-item:hover .preview-overlay {
  opacity: 1;
}

.remove-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #dc3545;
  font-size: 16px;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.add-more {
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.add-more:hover {
  border-color: #466543;
  background: #f0f5ed;
}

.add-more i {
  font-size: 24px;
  color: #466543;
  margin-bottom: 5px;
}

.add-more span {
  font-size: 14px;
  color: #666;
}

.dropdown {
  position: relative;
  appearance: none;
  background: none;
  padding-right: 30px;
}

.dropdown::after {
  content: '\f0d7';
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6c757d;
}

@media screen and (max-width: 768px) {
  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media screen and (max-width: 480px) {
  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>