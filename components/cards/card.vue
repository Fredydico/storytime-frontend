<template>
  <div :class="cardClass" @click="navigateToDetail">
    <div class="cardImg">
      <img :src="image" :class="imgClass" id="imgCover" alt="" />
      <div v-if="size === 'medium' && isUserProfile" class="cardIcons">
        <img 
          src="~/assets/iconEdit.png" 
          class="edit" 
          alt="Edit" 
          @click.stop="handleEdit" 
        />
        <img 
          src="~/assets/iconDelete.png" 
          class="delete" 
          alt="Delete" 
          @click.stop="handleDelete" 
        />
      </div>
      <img 
        :src="bookmarkIcon" 
        class="bookmark" 
        alt="bookmark" 
        @click.stop="handleBookmark"
      />
    </div>
    <div class="cardText">
      <h1 :class="titleClass">{{ title }}</h1>
      <p :class="descriptionClass">{{ description }}</p>
    </div>
    <div class="cardFooter">
      <div class="left">
        <img v-if="!isUserProfile" :src="author_img" class="avatar" alt="" />
        <h5 v-if="!isUserProfile" class="author">{{ author }}</h5>
        <p v-if="isUserProfile" class="category">{{ category }}</p>
      </div>
      <div class="right">
        <p class="date">{{ formattedDate }}</p>
        <p v-if="!isUserProfile" class="category">{{ category }}</p>
      </div>
    </div>
  </div>

  <ModalsModal
    :is-open="showDeleteModal"
    title="Delete Story"
    message="Are you sure want to delete this story?"
    confirm-text="Delete"
    cancel-text="Cancel"
    :on-confirm="confirmDelete"
    :on-cancel="() => showDeleteModal = false"
  />

  <!-- Toast Component - Keep it always mounted -->
  <ModalsToast 
    :message="toastMessage" 
    :type="'success'"
    v-model:is-visible="showToast"
  />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { deleteStory, checkBookmarkStatus, toggleBookmark } from '../store/fetchStory';
import { useAuth } from '../store/auth';
import bookmarkIconNormal from '../assets/iconBookmark.png';
import bookmarkIconFilled from '../assets/iconBookmarkFilled.png';

const router = useRouter();
const { isAuthenticated } = useAuth();
const isBookmarked = ref(false);
const showDeleteModal = ref(false);
const showToast = ref(false);
const toastMessage = ref("");

const props = defineProps({
  id: { type: Number, required: true },
  size: { type: String, default: "medium", validator: (value) => ["large", "medium", "small"].includes(value) },
  isUserProfile: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: String, required: true },
  image: { type: String, required: true },
  author_img: { type: String, required: true },
  category: { type: String, required: true },
});

const navigateToDetail = () => {
  router.push(`/story/${props.id}`);
};

const bookmarkIcon = computed(() => {
  return isBookmarked.value ? bookmarkIconFilled : bookmarkIconNormal;
});

const cardClass = computed(() => {
  return `card ${props.size}`;
});

const imgClass = computed(() => {
  return `cardImg ${props.size}Img`;
});

const titleClass = computed(() => {
  return `cardTitle ${props.size}Title`;
});

const descriptionClass = computed(() => {
  return `cardDescription ${props.size}Description`;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
};

const formattedDate = computed(() => {
  return formatDate(props.date);
});

const handleEdit = () => {
  router.push({
    path: '/writeStory',
    query: {
      edit: 'true',
      id: props.id.toString()
    }
  });
};

const handleDelete = async () => {
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  try {
    await deleteStory(props.id);
    // Store the toast message in localStorage before reload
    localStorage.setItem('toastMessage', 'Successfully deleted a story');
    window.location.reload();
  } catch (error) {
    alert(error.message || 'Failed to delete story. Please try again.');
  } finally {
    showDeleteModal.value = false;
  }
};

const handleBookmark = async () => {
  if (!isAuthenticated()) {
    toastMessage.value = "Login first!"
    showToast.value = true;
    return;
  }
  try {
    await toggleBookmark(props.id);
    isBookmarked.value = await checkBookmarkStatus(props.id);
    
    // Show toast message
    toastMessage.value = isBookmarked.value 
      ? "Successfully added story to bookmarks"
      : "Successfully removed story from bookmarks";
    showToast.value = true;
  } catch (error) {
    console.error('Bookmark error:', error);
    alert('Failed to update bookmark. Please try again.');
  }
};

const checkBookmark = async () => {
  if (isAuthenticated()) {
    try {
      isBookmarked.value = await checkBookmarkStatus(props.id);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  }
};

onMounted(() => {
  checkBookmark();
  
  // Check for stored toast message on mount
  const storedToastMessage = localStorage.getItem('toastMessage');
  if (storedToastMessage) {
    toastMessage.value = storedToastMessage;
    showToast.value = true;
    localStorage.removeItem('toastMessage');
  }
});
</script>

<style scoped>
.card {
  margin: 20px 10px;
  position: relative;
  transition: transform 0.3s;
  border: none;
  cursor: pointer;
}
.cardImg {
  border-radius: 8px;
  width: 100%;
  z-index: 2;
  position: relative;
  transition: opacity 0.5s;
}
.card:hover #imgCover {
  opacity: 0.5;
}
.card:hover .cardTitle {
  color: #466543;
}
.bookmark {
  position: absolute;
  cursor: pointer;
  transition: all 0.3s;
  width: 50px;
  height: 50px;
  z-index: 2;
}
.bookmark:hover {
  filter: brightness(0.7);
}
.edit:hover,
.delete:hover {
  filter: brightness(0.7);
}
.cardText {
  margin-top: 20px;
  width: 100%;
}
.cardTitle {
  font-weight: bold;
}
.cardIcons {
  position: absolute;
  display: flex;
  justify-content: space-between;
  top: 300px;
  right: 75px;
  z-index: 2;
  width: 110px;
  height: 50px;
}
.cardDescription {
  font-size: 15px;
  margin-top: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cardFooter {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.left {
  display: flex;
  align-items: center;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.author {
  margin-left: 10px;
  height: 15px;
  font-size: 18px;
}
.right {
  display: flex;
  align-items: center;
}
.date {
  margin-left: 10px;
  height: 15px;
  font-size: 17px;
}
.category {
  margin-left: 15px;
  padding-top: 2px;
  height: 15px;
  font-size: 15px;
  color: #466543;
}
/* Large Card */
.card.large {
  width: 900px;
}
.card .largeImg {
  width: 100%;
  height: 804px;
}
.card .largeTitle {
  font-size: 30px;
}
.card .largeDescription {
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
/* Medium Card */
.card.medium {
  width: 415px;
}
.card .mediumImg {
  width: 100%;
  height: 365.09px;
}
.card .mediumTitle {
  font-size: 30px;
  height: 72px;
}
.card .mediumDescription {
  -webkit-line-clamp: 3;
  line-clamp: 3;
  font-size: 15px;
  height: 67.5px;
}
/* Small Card */
.card.small {
  width: 393px;
}
.card .smallImg {
  width: 100%;
  height: 301.5px;
}
.card .smallTitle {
  font-size: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card .smallDescription {
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
/* Bookmark positioning */
.card.large .bookmark {
  top: 699px;
  right: 30px;
  width: 75px;
  height: 75px;
}
.card.medium .bookmark {
  top: 300px;
  right: 15px;
}
.card.small .bookmark {
  top: 235px;
  right: 15px;
}
@media (max-width: 1024px) {
  .card.large {
    width: 100%;
    max-width: 700px;
  }

  .card .largeImg {
    height: 600px;
  }

  .card.medium {
    width: 100%;
    max-width: 380px;
  }

  .card .mediumImg {
    height: 320px;
  }

  .card.small {
    width: 100%;
    max-width: 340px;
  }

  .card .smallImg {
    height: 260px;
  }
}

@media (max-width: 768px) {
  .card.large {
    max-width: 100%;
  }

  .card .largeImg {
    height: 400px;
  }

  .card.medium {
    max-width: 100%;
  }

  .card .mediumImg {
    height: 280px;
  }

  .card.small {
    max-width: 100%;
  }

  .card .smallImg {
    height: 220px;
  }

  .cardTitle {
    font-size: 24px !important;
  }

  .cardDescription {
    font-size: 14px !important;
  }

  .author {
    font-size: 16px;
  }

  .date {
    font-size: 14px;
  }

  .category {
    font-size: 13px;
  }

  .bookmark {
    width: 40px !important;
    height: 40px !important;
  }

  .cardIcons {
    right: 60px;
    top: 220px;
    width: 90px;
  }

  .cardIcons img {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .card .largeImg {
    height: 300px;
  }

  .card .mediumImg {
    height: 220px;
  }

  .card .smallImg {
    height: 180px;
  }

  .cardTitle {
    font-size: 20px !important;
  }

  .cardDescription {
    font-size: 13px !important;
  }

  .cardFooter {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .right {
    width: 100%;
    justify-content: space-between;
  }

  .bookmark {
    width: 35px !important;
    height: 35px !important;
  }

  .cardIcons {
    right: 50px;
    top: 180px;
    width: 80px;
  }

  .cardIcons img {
    width: 35px;
    height: 35px;
  }
}
</style>