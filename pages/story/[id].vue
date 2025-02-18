<template>
  <div>
    <Header></Header>
    <div v-if="story" class="detailStory">
      <div class="titleContainer">
        <img 
          :src="isBookmarked ? bookmarkIconFilled : bookmarkIconNormal" 
          class="bookmarkIcon" 
          alt="bookmark" 
          @click="handleBookmark" 
        />
        <h5 class="dateDetStory">{{ formattedDate }}</h5>
        <h1 class="titleDetStory">{{ story.title }}</h1>
        <div class="containerAuthor">
          <img :src="story.author_image || '../assets/avatar.png'" alt="author" class="imgDetStory" />
          <p class="authorDetStory">{{ story.author_name }}</p>
        </div>
      </div>
      <div class="storyContainer">
        <div class="left">
          <div class="mainImage" @click="openModal(story.cover)">
            <img :src="story.cover" class="largeImage" alt="Main story image" />
          </div>
          <div class="otherImage">
            <img 
              v-for="(image, index) in story.images" 
              :key="index" 
              :src="image" 
              class="smallImage" 
              alt="Story image" 
              @click="openModal(image)" 
            />
          </div>
        </div>
        <div class="right">
          <p class="storyText">{{ story.content }}</p>
        </div>
      </div>
    </div>
    <div v-else class="loading">Loading...</div>

    <!-- Image Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="close-button" @click="closeModal">&times;</button>
          <button class="nav-button prev" @click="previousImage" v-if="allImages.length > 1">&lt;</button>
          <button class="nav-button next" @click="nextImage" v-if="allImages.length > 1">&gt;</button>

          <div class="modal-main-image">
            <img :src="currentImage" alt="Modal image" class="modal-image" />
          </div>

          <div class="modal-thumbnails">
            <img 
              v-for="(image, index) in allImages" 
              :key="index" 
              :src="image" 
              :class="['modal-thumbnail', { active: currentImage === image }]" 
              @click="openModal(image)" 
              alt="Thumbnail" 
            />
          </div>
        </div>
      </div>
    </Teleport>

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
  max-width: 1440px;
  margin: 0 auto;
  position: relative;
}

.titleContainer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  margin: 0 auto;
}

.bookmarkIcon {
  position: absolute;
  top: 148px;
  right: 0px;
  width: 65px;
  height: 65px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.bookmarkIcon:hover {
  transform: scale(1.1);
}

.storyContainer {
  display: flex;
  justify-content: space-between;
  margin-top: 60px;
  gap: 30px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.left {
  width: 34%;
  height: auto;
}

.right {
  width: 65%;
  height: auto;
  overflow-x: hidden;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Playfair", serif;
  font-size: 40px;
}

.mainImage {
  margin-bottom: 10px;
  cursor: pointer;
}

.largeImage {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 8px;
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
  scrollbar-width: thin;
}

.otherImage::-webkit-scrollbar {
  height: 6px;
}

.otherImage::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
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
  margin-bottom: 10px;
}

.titleDetStory {
  font-family: "Playfair", serif;
  font-size: 50px;
  font-weight: bold;
  margin: 15px 0;
  text-align: center;
}

.containerAuthor {
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 15px;
}

.imgDetStory {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  object-fit: cover;
}

.authorDetStory {
  font-size: 23px;
  font-weight: 500;
}

.storyText {
  font-size: 17px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap; 
  word-wrap: break-word; 
  overflow-wrap: break-word; 
  width: 100%; 
  max-width: 100%; 
  padding-right: 20px; 
}

.similarContainer {
  margin-top: 60px;
  max-width: 1440px;
  margin-left: auto;
  margin-right: auto;
}

.similarGrid {
  display: grid;
  padding: 0 90px;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-main-image {
  width: 100%;
  height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.modal-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
  justify-content: center;
}

.modal-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  border-radius: 4px;
}

.modal-thumbnail.active,
.modal-thumbnail:hover {
  opacity: 1;
}

.close-button {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 10px;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 24px;
  padding: 20px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.prev {
  left: -60px;
}

.next {
  right: -60px;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .detailStory {
    padding: 30px 40px;
  }
  
  .titleDetStory {
    font-size: 40px;
  }
  
  .similarGrid {
    grid-template-columns: repeat(2, 1fr);
    padding: 0 40px;
  }
  
  .nav-button {
    padding: 15px 10px;
  }
  
  .prev {
    left: -40px;
  }
  
  .next {
    right: -40px;
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
  }
  
  .nav-button {
    display: none;
  }
  
  .close-button {
    top: -30px;
    right: 0;
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
  
  .bookmarkIcon {
    width: 28px;
    height: 28px;
  }
  
  .modal-thumbnail {
    width: 60px;
    height: 60px;
  }
}
</style>