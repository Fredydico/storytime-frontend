<template>
  <div>
    <Header></Header>
    <div v-if="story" class="detailStory">
      <div class="titleContainer">
        <h5 class="dateDetStory">{{ formattedDate }}</h5>
        <h1 class="titleDetStory">{{ story.title }}</h1>
        <div class="containerAuthor">
          <img :src="story.image || '../assets/avatar.png'" alt="author" class="imgDetStory" width="60px" />
          <p class="authorDetStory">{{ story.author_name }}</p>
        </div>
        <img :src="isBookmarked ? bookmarkIconFilled : bookmarkIconNormal" class="bookmarkIcon" alt="bookmark" @click="handleBookmark" />
      </div>
      <div class="storyContainer">
        <div class="left">
          <div class="mainImage">
            <img :src="story.cover" class="largeImage" alt="" @click="openModal(story.cover)" />
          </div>
          <div class="otherImage">
            <img v-for="(image, index) in story.images" :key="index" :src="image" class="smallImage" alt="" @click="openModal(image)" />
          </div>
        </div>
        <div class="right">
          <p class="storyText">{{ story.content }}</p>
        </div>
      </div>
    </div>
    <div v-else class="loading">Loading...</div>

    <!-- Image Modal -->
    <div v-if="showModal" class="modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="closeModal">&times;</button>
        <button class="nav-button prev" @click="previousImage" v-if="allImages.length > 1">&lt;</button>
        <button class="nav-button next" @click="nextImage" v-if="allImages.length > 1">&gt;</button>

        <!-- Main Modal Image -->
        <div class="modal-main-image">
          <img :src="currentImage" alt="" class="modal-image" />
        </div>

        <!-- Thumbnail Navigation -->
        <div class="modal-thumbnails">
          <img v-for="(image, index) in allImages" :key="index" :src="image" :class="['modal-thumbnail', { active: currentImage === image }]" @click="openModal(image)" alt="" />
        </div>
      </div>
    </div>

    <div class="similarContainer">
      <IndexTitles titleText="Similar Story" :exploreMore="false"></IndexTitles>
      <div class="similarGrid">
        <CardsCard
          v-for="similarStory in similarStories"
          :key="similarStory.id"
          :id="similarStory.id"
          size="medium"
          :title="similarStory.title"
          :description="similarStory.content"
          :author="similarStory.author_name"
          :date="similarStory.created_at"
          :image="similarStory.cover"
          :author_img="similarStory.author_image || '../assets/avatar.png'"
          :category="similarStory.category"
        />
      </div>
    </div>

    <!-- Toast Component -->
    <ModalsToast v-model:isVisible="showToast" :message="toastMessage" :type="'success'" />

    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { fetchStoryDetail, checkBookmarkStatus, toggleBookmark, fetchStories } from "../../store/fetchStory";
import { useAuth } from "../../store/auth";
import bookmarkIconNormal from "../../assets/iconBookmark.png";
import bookmarkIconFilled from "../../assets/iconBookmarkFilled.png";

interface Story {
  id: number;
  title: string;
  cover: string;
  created_at: string;
  category: string;
  images: string[];
  content: string;
  author_id: number;
  author_name: string;
  author_image: string;
  image: string | null;
}

const route = useRoute();
const { isAuthenticated } = useAuth();
const story = ref<Story | null>(null);
const similarStories = ref<Story[]>([]);
const isBookmarked = ref(false);
const showModal = ref(false);
const currentImage = ref("");
const currentImageIndex = ref(0);
const showToast = ref(false);
const toastMessage = ref("");

const allImages = computed(() => {
  if (!story.value) return [];
  return [story.value.cover, ...story.value.images];
});

const formattedDate = computed(() => {
  if (!story.value?.created_at) return "";
  const date = new Date(story.value.created_at);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const openModal = (image: string) => {
  currentImage.value = image;
  currentImageIndex.value = allImages.value.indexOf(image);
  showModal.value = true;
  document.body.style.overflow = "hidden";
};

const closeModal = () => {
  showModal.value = false;
  document.body.style.overflow = "auto";
};

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % allImages.value.length;
  currentImage.value = allImages.value[currentImageIndex.value];
};

const previousImage = () => {
  currentImageIndex.value = currentImageIndex.value === 0 ? allImages.value.length - 1 : currentImageIndex.value - 1;
  currentImage.value = allImages.value[currentImageIndex.value];
};

const handleBookmark = async () => {
  if (!isAuthenticated()) {
    alert("Please login to bookmark stories");
    return;
  }

  if (!story.value) return;

  try {
    await toggleBookmark(story.value.id);
    isBookmarked.value = await checkBookmarkStatus(story.value.id);
    
    // Update toast message
    toastMessage.value = isBookmarked.value 
      ? "Successfully added story to bookmarks"
      : "Successfully removed story from bookmarks";
    showToast.value = true;
    
    // No need for setTimeout anymore as the Toast component handles its own timing
  } catch (error) {
    console.error("Bookmark error:", error);
    alert("Failed to update bookmark. Please try again.");
  }
};

const fetchSimilarStories = async (category: string, currentStoryId: number) => {
  try {
    const stories = await fetchStories({ category });
    const filteredStories = stories
      .filter((s: Story) => s.id !== currentStoryId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    similarStories.value = filteredStories;
  } catch (error) {
    console.error("Error fetching similar stories:", error);
  }
};

const fetchData = async () => {
  try {
    const storyId = parseInt(route.params.id as string);
    story.value = await fetchStoryDetail(storyId);
    if (story.value) {
      await fetchSimilarStories(story.value.category, storyId);
    }
    if (isAuthenticated()) {
      isBookmarked.value = await checkBookmarkStatus(storyId);
    }
  } catch (error) {
    console.error("Error fetching story:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.detailStory {
  padding: 50px 90px;
  width: 100%;
}
.titleContainer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}
.storyContainer {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
  gap: 30px;
}
.left {
  width: 34%;
  height: auto;
  border: none;
}
.right {
  width: 65%;
  height: auto;
  border: none;
}
.mainImage {
  margin-bottom: 10px;
}
.largeImage {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.largeImage:hover {
  transform: scale(1.02);
}
.otherImage {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 10px;
}
.smallImage {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.smallImage:hover {
  transform: scale(1.05);
}
.dateDetStory {
  font-size: 18px;
  color: grey;
  font-weight: 400;
}
.titleDetStory {
  font-family: "Playfair", serif;
  font-size: 50px;
  font-weight: bold;
  margin-top: 15px;
  text-align: center;
}
.containerAuthor {
  display: flex;
  align-items: center;
  margin-top: 10px;
}
.imgDetStory {
  margin-right: 15px;
  width: 65px;
  height: 65px;
  border-radius: 50%;
}
.authorDetStory {
  font-size: 23px;
  font-weight: 500;
  margin: auto;
}
.storyText {
  font-size: 17px;
}
.similarContainer {
  margin-top: 60px;
}
.similarGrid {
  display: grid;
  padding: 0px 90px;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Modal styles remain the same */

/* Responsive styles */
@media (max-width: 1200px) {
  .detailStory {
    padding: 30px 40px;
  }
  
  .storyContainer {
    gap: 20px;
  }
  
  .titleDetStory {
    font-size: 40px;
  }
  
  .similarGrid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 40px;
  }
  
  .modal-content {
    width: 80%;
  }
}

@media (max-width: 768px) {
  .detailStory {
    padding: 20px;
  }
  
  .storyContainer {
    flex-direction: column;
  }
  
  .left,
  .right {
    width: 100%;
  }
  
  .titleDetStory {
    font-size: 32px;
  }
  
  .authorDetStory {
    font-size: 18px;
  }
  
  .imgDetStory {
    width: 50px;
    height: 50px;
  }
  
  .similarGrid {
    grid-template-columns: 1fr;
    padding: 0 20px;
    gap: 30px;
  }
  
  .modal-content {
    width: 95%;
  }
  
  .modal-main-image {
    height: 50vh;
  }
  
  .nav-button {
    display: none;
  }
  
  .otherImage {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .detailStory {
    padding: 15px;
  }
  
  .titleDetStory {
    font-size: 24px;
  }
  
  .dateDetStory {
    font-size: 14px;
  }
  
  .storyText {
    font-size: 16px;
  }
  
  .smallImage {
    width: 80px;
    height: 80px;
  }
  
  .modal-thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .close-button {
    top: -30px;
    right: -10px;
    font-size: 24px;
  }
  
  .bookmarkIcon {
    width: 40px;
    height: 40px;
    top: 15px;
    right: 15px;
  }
}
</style>