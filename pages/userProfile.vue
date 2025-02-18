<template>
  <Header></Header>
  <div class="containerProf">
    <div class="container w-100">
      <img :src="user?.image || defaultAvatar" alt="Avatar" class="avatar" />
      <div class="containerDet">
        <h1>{{ user.name }}</h1>
        <p>{{ user.email }}</p>
        <p>{{ user.aboutme }}</p>
      </div>
      <ButtonSolid class="buttonEdit" buttonText="Edit Profile" @click="openModal"></ButtonSolid>
    </div>
  </div>

  <div class="containerLinks">
    <a class="link" :class="{ active: activeTab === 'My Story' }" @click.prevent="setActiveTab('My Story')">My Story</a>
    <a class="link" :class="{ active: activeTab === 'Bookmarks' }" @click.prevent="setActiveTab('Bookmarks')">Bookmarks</a>
  </div>

  <div class="containerStory">
    <div class="write sticky">
      <h2>Write your Story</h2>
      <p>Share your unique voice with the world - start writing your story today!</p>
      <ButtonSolid buttonText="Write Now" class="buttonWrite" routeTo="/writeStory"></ButtonSolid>
    </div>
    <div v-if="activeTab == 'My Story' && totalCards === 0" class="noStory my">
      <h1 class="textNoStory">No Stories Yet</h1>
      <p class="pNoStory">You haven't shared any stories yet. Start your fitness journey today!</p>
      <img src="/assets/noStory.png" alt="no story" class="imgNoStory" />
    </div>
    <div v-if="activeTab == 'Bookmarks' &&totalCards === 0" class="noStory bookmarks">
      <h1 class="textNoStory">No Bookmarks Yet</h1>
      <p class="pNoStory">You haven't saved any bookmarks yet. Explore and bookmark your top workouts!</p>
      <img src="/assets/noBookmarks.png" alt="no story" class="imgNoStory" />
    </div>
    <div class="containerCards">
      <div class="cards">
        <CardsCard
          v-for="story in paginatedStories"
          :id="story.id"
          :key="story.id"
          :isUserProfile="activeTab === 'My Story'"
          size="medium"
          :title="story.title"
          :description="story.content"
          :author="story.author_name"
          :date="story.created_at"
          :image="story.cover"
          :author_img="story.author_image"
          :category="story.category"
        />
      </div>
      <div class="pagination" v-if="showPagination">
        <PaginationNumLight buttonText="Back" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)" />
        <template v-for="(page, index) in visiblePages" :key="index">
          <PaginationNum v-if="page === currentPage" :buttonText="page.toString()" @click="setPage(page)" />
          <PaginationNumLight v-else-if="typeof page === 'number'" :buttonText="page.toString()" @click="setPage(page)" />
          <PaginationNumLight v-else-if="page === '-3'" class="ellipsis" button-text="..." @click="setPage(currentPage - 3)" />
          <PaginationNumLight v-else-if="page === '+3'" class="ellipsis" button-text="..." @click="setPage(currentPage + 3)" />
        </template>
        <PaginationNumLight buttonText="Next" :disabled="!hasNextPage" @click="nextPage" />
      </div>
    </div>
  </div>
  <Footer></Footer>

  <EditProfileModal :isVisible="isModalVisible" @close="closeModal" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuth } from "~/store/auth";
import { fetchUserStory, fetchBookmarkStory } from "~/store/fetchStory";

import ButtonSolid from "~/components/input/ButtonSolid.vue";
import EditProfileModal from "~/components/profile/EditProfileModal.vue";
import PaginationNum from "~/components/pagination/PaginationNum.vue";
import PaginationNumLight from "~/components/pagination/PaginationNumLight.vue";
import defaultAvatar from "~/assets/avatar.png";

const { user } = useAuth();

const isModalVisible = ref(false);

const cardsPerPage = 4;
const currentPage = ref(1);
const activeTab = ref('My Story');

interface Story {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  category_id: number;
  cover: string;
  author_name: string;
  author_image: string;
  deleted_at: string | null;
  category: string;
}

interface Bookmark {
  id: number;
  story: Story;
  user_id: number;
  username: string;
  author_image: string;
  author_name: string;
}

const userAllStory = ref<Story[]>([]);
const bookmarkAllStory = ref<Bookmark[]>([]);

const fetchUserStories = async () => {
  try {
    const userStory = await fetchUserStory();
    userAllStory.value = userStory;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const fetchBookmarkStories = async () => {
  try {
    const bookmarkStory = await fetchBookmarkStory();
    bookmarkAllStory.value = bookmarkStory;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchUserStories();
  fetchBookmarkStories();
});

const totalCards = computed(() => {
  if (activeTab.value === 'My Story') {
    return userAllStory.value.length;
  } else if (activeTab.value === 'Bookmarks') {
    return bookmarkAllStory.value.length;
  }
  return 0;
});

const totalPages = computed(() => Math.ceil(totalCards.value / cardsPerPage));

const showPagination = computed(() => totalCards.value > cardsPerPage);

const hasNextPage = computed(() => currentPage.value < totalPages.value);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 7;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage.value > 3) {
      pages.push("-3");
    }
    if (currentPage.value > 2) {
      pages.push(currentPage.value - 1);
    }
    if (currentPage.value > 1) {
      pages.push(currentPage.value);
    }
    if (currentPage.value < totalPages.value - 1) {
      pages.push(currentPage.value + 1);
    }
    if (currentPage.value < totalPages.value - 2) {
      pages.push("+3");
    }
    if (totalPages.value > 1 && currentPage.value !== totalPages.value) {
      pages.push(totalPages.value);
    }
  }

  return pages;
});

const paginatedStories = computed(() => {
  const start = (currentPage.value - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  if (activeTab.value === 'My Story') {
    return userAllStory.value.slice(start, end);
  } else if (activeTab.value === 'Bookmarks') {
    return bookmarkAllStory.value.slice(start, end).map(bookmark => bookmark.story);
  }
  return [];
});

const scrollToTop = () => {
  window.scrollTo({
    top: 400,
    behavior: "smooth",
  });
};

const setPage = (page: number) => {
  currentPage.value = page;
  scrollToTop();
};

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
    scrollToTop();
  }
};

const setActiveTab = (tab: string) => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const openModal = () => {
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};
</script>

<style scoped>
.containerProf {
  padding-top: 80px;
  padding-bottom: 80px;
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 65%;
  margin: 0 auto;
}

.containerDet {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 65%;
}

h1 {
  font-weight: bolder;
}

p {
  font-size: 18px;
}

.containerLinks {
  display: flex;
  justify-content: space-evenly;
  width: 25%;
  margin: 80px 0 25px 50px;
}

.link {
  font-size: 20px;
  font-weight: 500;
  text-decoration: none;
  color: black;
  cursor: pointer;
}

.link.active {
  padding-bottom: 5px;
  border-bottom: 3.5px solid #466543;
}

.noStory {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 800px;
  margin: 20px 0px 0px 25px;
}

.textNoStory {
  font-size: 50px;
  font-weight: bolder;
  font-family: "Playfair", serif;
  font-weight: 500;
  text-decoration: none;
  color: black;
  margin-bottom: 25px;
}

.pNoStory {
  font-size: 20px;
  text-decoration: none;
  color: black;
  margin-bottom: 25px;
}

.imgNoStory {
  width: 500px;
}

.containerStory {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
}

.write {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  text-align: center;
  width: 432px;
  height: 320px;
  border: 1px solid rgb(187, 187, 187);
  border-radius: 5px;
  padding: 50px 50px;
  margin-left: 90px;
  margin-top: 20px;
  align-items: center;
}

.write h2 {
  font-size: 30px;
  font-weight: 600;
}

.write p {
  font-size: 15px;
}

.containerCards {
  display: flex;
  flex-direction: column;
}

.cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-right: 90px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button:focus {
  outline: none;
  border: none;
}

.ellipsis {
  user-select: none;
}

.active {
  color: black;
}

.sticky {
  position: sticky;
  top: 90px;
  z-index: 10;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .container {
    width: 80%;
  }
  
  .containerLinks {
    width: 35%;
  }
  
  .write {
    width: 350px;
    margin-left: 40px;
  }
  
  .cards {
    margin-right: 40px;
  }
  
  .noStory {
    width: 600px;
  }
  
  .imgNoStory {
    width: 400px;
  }

  .sticky {
    position: absolute;
    margin-top: 0;
    margin-bottom: 100px;
  }
}

@media (max-width: 768px) {
  .container {
    width: 90%;
    flex-direction: column;
    text-align: center;
  }
  
  .avatar {
    width: 150px;
    height: 150px;
    margin-bottom: 20px;
  }
  
  .containerDet {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .containerLinks {
    width: 80%;
    margin: 40px auto 25px;
  }
  
  .containerStory {
    flex-direction: column;
  }
  
  .write {
    width: auto;
    margin: 20px 20px 40px;
  }
  
  .cards {
    grid-template-columns: 1fr;
    margin: 0 20px;
  }
  
  .noStory {
    width: auto;
    margin: 20px;
    text-align: center;
  }
  
  .textNoStory {
    font-size: 36px;
  }
  
  .pNoStory {
    font-size: 18px;
  }
  .sticky {
    position: relative;
    margin-top: 0;
    margin-bottom: 100px;
  }
}

@media (max-width: 480px) {
  .containerProf {
    padding-top: 40px;
    padding-bottom: 40px;
  }
  
  .avatar {
    width: 120px;
    height: 120px;
  }
  
  .containerDet h1 {
    font-size: 24px;
  }
  
  .containerDet p {
    font-size: 16px;
  }
  
  .containerLinks {
    width: 90%;
  }
  
  .link {
    font-size: 16px;
  }
  
  .write {
    padding: 30px 20px;
  }
  
  .write h2 {
    font-size: 24px;
  }
  
  .write p {
    font-size: 14px;
  }
  
  .imgNoStory {
    width: 300px;
  }
  
  .textNoStory {
    font-size: 28px;
  }
  
  .pNoStory {
    font-size: 16px;
  }
  .sticky {
    position: relative;
    margin-top: 0;
    margin-bottom: 100px;
  }
}
</style>