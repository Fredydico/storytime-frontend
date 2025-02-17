<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchCategories, postStory, fetchSingleStory, updateStory } from "~/store/fetchStory";
import BaseInput from "~/components/input/BaseInput.vue";
import ButtonLight from "~/components/input/ButtonLight.vue";
import ButtonSolid from "~/components/input/ButtonSolid.vue";

const route = useRoute();
const router = useRouter();
const isEditing = ref(false);
const storyId = ref<number | null>(null);

// const categoriesData = ref([]);
const isSubmitting = ref(false);

const storyData = reactive({
  title: "",
  category_id: "",
  content: "",
  cover: [] as File[],
  coverPreviews: [] as string[],
  existingCover: "",
});

interface Category {
  id: number; // atau string, tergantung pada tipe ID yang Anda gunakan
  name: string;
  // Tambahkan properti lain jika diperlukan
}

const categoriesData = ref<Category[]>([]);

onMounted(async () => {
  try {
    const categories = await fetchCategories();
    categoriesData.value = categories;

    console.log(categoriesData.value);

    // Check if we're in edit mode
    const editMode = route.query.edit === "true";
    const id = route.query.id ? Number(route.query.id) : null;

    if (editMode && id) {
      isEditing.value = true;
      storyId.value = id;
      const story = await fetchSingleStory(id);

      // Populate form with existing story data
      storyData.title = story.title;
      storyData.category_id = story.category;
      storyData.content = story.content;
      storyData.existingCover = story.cover;

      console.log(story);
      console.log(storyData.category_id);

      // Find the matching category and update storyData.category_id with its ID
      const matchingCategory = categoriesData.value.find((category) => category.name === storyData.category_id);
      if (matchingCategory) {
        storyData.category_id = matchingCategory.id.toString(); // Convert ID to string if necessary
      }

      // Add existing images to preview
      if (story.cover) {
        storyData.coverPreviews = [story.cover];
      }
      if (story.images) {
        storyData.coverPreviews.push(...story.images);
      }
    }
  } catch (error) {
    console.error("Error initializing page:", error);
    alert("Failed to load story data. Please try again.");
    router.push("/userProfile");
  }
});

const handleCategoryChange = (value: string) => {
  storyData.category_id = String(value);
};

const handleImageUpload = (files: FileList) => {
  const remainingSlots = 5 - storyData.cover.length;
  const filesToAdd = Array.from(files).slice(0, remainingSlots);

  if (!storyData.cover) {
    storyData.cover = [];
    storyData.coverPreviews = [];
  }

  storyData.cover.push(...filesToAdd);
  const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
  storyData.coverPreviews.push(...newPreviews);
};

const removeImage = (index: number) => {
  URL.revokeObjectURL(storyData.coverPreviews[index]);
  storyData.cover.splice(index, 1);
  storyData.coverPreviews.splice(index, 1);
};

const validateForm = (): string | null => {
  if (!storyData.title.trim()) {
    return "Please enter a title";
  }

  if (!storyData.category_id) {
    return "Please select a category";
  }

  if (!storyData.content.trim()) {
    return "Please enter content for your story";
  }

  if (storyData.cover.length < 2 && !isEditing.value) {
    return "Please upload at least 2 images";
  }

  return null;
};

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  const validationError = validateForm();
  if (validationError) {
    alert(validationError);
    return;
  }

  try {
    isSubmitting.value = true;

    if (isEditing.value && storyId.value) {
      await updateStory(storyId.value, storyData);
      localStorage.setItem("toastMessage", "Story updated successfully!");
    } else {
      await postStory(storyData);
      localStorage.setItem("toastMessage", "Story posted successfully!");
    }

    router.push("/userProfile");
  } catch (error: any) {
    console.error("Error saving story:", error);
    alert(error.message || "Failed to save story. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Header></Header>
  <div class="containerStory">
    <div class="buttonTop">
      <NuxtLink to="/userProfile">
        <i class="fa-solid fa-arrow-left"></i>
      </NuxtLink>
      <h1>{{ isEditing ? "Edit Story" : "Write Story" }}</h1>
    </div>

    <div class="writeStoryForm">
      <BaseInput type="text" label="Title" identity="title" placeholder="Enter a story title" width="100%" v-model="storyData.title" />

      <BaseInput
        type="dropdown"
        :isDropdown="true"
        label="Category"
        identity="category"
        placeholder="Select a category"
        width="100%"
        :dropdownOptions="categoriesData"
        :modelValue="storyData.category_id"
        @update:modelValue="handleCategoryChange"
      />

      <BaseInput type="textarea" label="Content" identity="story" placeholder="Write your story here" :isToolbar="true" height="80px" width="100%" v-model="storyData.content" />

      <div class="form-cover-image my-5">
        <BaseInput
          type="file"
          label="Cover Images"
          identity="coverImages"
          placeholder="Choose images"
          width="75%"
          :isImage="true"
          :multiple="true"
          :previewImages="storyData.coverPreviews"
          @file-selected="handleImageUpload"
          @remove-image="removeImage"
          :maxFiles="5"
          :minFiles="2"
        />
        <div class="image-count" :class="{ 'text-error': storyData.cover.length < 2 && !isEditing }">
          {{ storyData.coverPreviews.length }}/5 images uploaded
          <span v-if="storyData.cover.length < 2 && !isEditing" class="error-message"> ({{ 2 - storyData.cover.length }} more required) </span>
        </div>
      </div>
    </div>

    <div class="button-group">
      <ButtonLight routeTo="/userProfile" buttonText="Cancel" />
      <ButtonSolid :buttonText="isEditing ? 'Update Story' : 'Post Story'" @click="handleSubmit" :disabled="isSubmitting" />
    </div>
  </div>
</template>

<style scoped>
.containerStory {
  padding: 50px 90px;
  width: 100%;
}

.buttonTop {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-family: "Playfair", serif;
}

.buttonTop h1 {
  font-weight: bolder;
  font-size: 40px;
}

.buttonTop i {
  font-size: 30px;
  margin-right: 50px;
  color: black;
}

.image-count {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.text-error {
  color: #dc3545;
}

.error-message {
  font-style: italic;
}

@media screen and (max-width: 768px) {
  .containerStory {
    padding: 20px;
  }
}
</style>
