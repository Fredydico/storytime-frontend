<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchCategories, fetchPopularStories, fetchNewestStories } from "~/store/fetchStory";

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

interface Category {
  id: number;
  name: string;
}

// State Variables
const sortByOptions = ["Newest", "Oldest", "Popular", "A - Z", "Z - A"];
const selectedSortBy = ref("Newest");
const selectedCategory = ref("All");
const allStories = ref<Story[]>([]);
const allCategory = ref<string[]>([]);
const filteredStories = ref<Story[]>([]);
const cardsPerPage = 12;
const currentPage = ref(1);
const isOpen = ref({
  sortBy: false,
  category: false,
});
const isLoading = ref(true);
const route = useRoute();
const searchQuery = ref((route.query.search as string) || "");

// Initialize filteredStories as an empty array
filteredStories.value = [];

// Computed Properties
const totalCards = computed(() => (Array.isArray(filteredStories.value) ? filteredStories.value.length : 0));
const totalPages = computed(() => Math.ceil(totalCards.value / cardsPerPage));
const displayedStories = computed(() => {
  if (!Array.isArray(filteredStories.value)) return [];
  const start = (currentPage.value - 1) * cardsPerPage;
  return filteredStories.value.slice(start, start + cardsPerPage);
});
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
    if (currentPage.value > 3) pages.push("-3");
    if (currentPage.value > 2) pages.push(currentPage.value - 1);
    if (currentPage.value > 1) pages.push(currentPage.value);
    if (currentPage.value < totalPages.value - 1) pages.push(currentPage.value + 1);
    if (currentPage.value < totalPages.value - 2) pages.push("+3");
    if (totalPages.value > 1 && currentPage.value !== totalPages.value) pages.push(totalPages.value);
  }

  return pages;
});

const searchMessage = computed(() => {
  if (searchQuery.value) {
    return `${totalCards.value} results for "${searchQuery.value}"`;
  }
  return "";
});

// Sort stories based on selected option
const sortStories = (stories: Story[]) => {
  if (!Array.isArray(stories)) return [];
  
  let sortedStories = [...stories];
  
  switch (selectedSortBy.value) {
    case "Oldest":
      // Sort by created_at in ascending order (oldest first)
      sortedStories.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      break;
    case "A - Z":
      sortedStories.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "Z - A":
      sortedStories.sort((a, b) => b.title.localeCompare(a.title));
      break;
    // For "Newest" and "Popular", we use the order from the API
    default:
      break;
  }
  
  return sortedStories;
};

// Filter stories by category
const filterByCategory = (stories: Story[]) => {
  if (selectedCategory.value === "All") return stories;
  return stories.filter(story => 
    story.category.toLowerCase() === selectedCategory.value.toLowerCase()
  );
};

// Filter stories by search query
const filterBySearch = (stories: Story[]) => {
  if (!searchQuery.value) return stories;
  const query = searchQuery.value.toLowerCase();
  return stories.filter(story => 
    story.title.toLowerCase().includes(query)
  );
};

// Fetch Data with API sorting
const fetchData = async () => {
  isLoading.value = true;
  try {
    let stories;
    const categories = await fetchCategories();
    
    // Fetch stories based on sort option
    switch (selectedSortBy.value) {
      case "Popular":
        stories = await fetchPopularStories();
        break;
      case "Oldest":
      case "Newest":
        stories = await fetchNewestStories();
        break;
      default:
        stories = await fetchNewestStories();
    }

    // Ensure stories is an array
    stories = Array.isArray(stories) ? stories : [];

    // Apply filters in sequence
    let processedStories = stories;
    processedStories = filterByCategory(processedStories);
    processedStories = filterBySearch(processedStories);
    processedStories = sortStories(processedStories);

    // Update state
    allStories.value = stories;
    allCategory.value = Array.isArray(categories) 
      ? ["All", ...categories.map((category: Category) => category.name)]
      : ["All"];
    filteredStories.value = processedStories;
    
    // Reset to first page when data changes
    currentPage.value = 1;
  } catch (error) {
    console.error("Error fetching data:", error);
    filteredStories.value = [];
    allStories.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle Hooks
onMounted(() => {
  const categoryFromQuery = route.query.category as string;
  if (categoryFromQuery) {
    selectedCategory.value = categoryFromQuery;
  }
  fetchData();
});

// Watchers
watch([selectedCategory, searchQuery, selectedSortBy], () => {
  fetchData();
});

// Methods
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
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

const toggleDropdown = (type: "sortBy" | "category"): void => {
  isOpen.value[type] = !isOpen.value[type];
};

const selectOption = (type: "sortBy" | "category", item: string): void => {
  if (type === "sortBy") {
    selectedSortBy.value = item;
  } else if (type === "category") {
    selectedCategory.value = item;
  }
  isOpen.value[type] = false;
};

const handleSearch = () => {
  fetchData();
};

const getSortByClass = (item: string) => (selectedSortBy.value === item ? "selected" : "");
const getCategoryClass = (item: string) => (selectedCategory.value === item ? "selected" : "");
</script>

<template>
  <Header></Header>
  <div class="allStory">
    <h1 class="titleAllStory" v-if="!searchMessage">All Story</h1>
    <h1 class="titleAllStory" v-if="searchMessage">{{ searchMessage }}</h1>
    <div class="sortContainer">
      <div class="sort">
        <div class="sortBy">
          <p class="titleSort">Sort by</p>
          <div class="dropdown" @click="toggleDropdown('sortBy')">
            <p>{{ selectedSortBy }}</p>
            <i class="fa-solid fa-caret-down"></i>
          </div>
          <ul class="sortDDBy" v-if="isOpen.sortBy">
            <li v-for="(item, index) in sortByOptions" :key="index" @click="selectOption('sortBy', item)" :class="getSortByClass(item)">
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="category">
          <p class="titleSort">Category</p>
          <div class="dropdown" @click="toggleDropdown('category')">
            <p>{{ selectedCategory }}</p>
            <i class="fa-solid fa-caret-down"></i>
          </div>
          <ul class="sortDDCategory" v-if="isOpen.category">
            <li v-for="(item, index) in allCategory" :key="index" @click="selectOption('category', item)" :class="getCategoryClass(item)">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
      <div class="inputContainer">
        <input type="text" placeholder="Search story" class="searchIndex" v-model="searchQuery" @input="handleSearch" />
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="searchIcon">
          <path
            d="M9.5 4a6.5 6.5 0 0 1 6.5 6.5c0 1.62-.59 3.1-1.57 4.23l5.65 5.65l-.71.71l-5.65-5.65A6.47 6.47 0 0 1 9.5 17A6.5 6.5 0 0 1 3 10.5A6.5 6.5 0 0 1 9.5 4m0 1A5.5 5.5 0 0 0 4 10.5A5.5 5.5 0 0 0 9.5 16a5.5 5.5 0 0 0 5.5-5.5A5.5 5.5 0 0 0 9.5 5"
          />
        </svg>
      </div>
    </div>
    <div class="cardAll">
      <div v-if="!isLoading && filteredStories.length === 0" class="noStory">
        <h1 class="textNoStory">Story Not Found</h1>
      </div>
      <div v-else-if="isLoading" class="loading">
        <h1 class="textNoStory">Loading...</h1>
      </div>
      <div v-else class="cards">
        <CardsCard
          v-for="story in displayedStories"
          :key="story.id"
          :id="story.id"
          :title="story.title"
          :description="story.content"
          :author="story.author_name"
          :author_img="story.author_image"
          :date="story.created_at"
          :image="story.cover"
          :category="story.category"
        />
      </div>
      <div class="pagination" v-if="showPagination">
        <PaginationNumLight buttonText="Back" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)" />
        <template v-for="(page, index) in visiblePages" :key="index">
          <PaginationNum v-if="page === currentPage" :buttonText="page.toString()" @click="setPage(page)" />
          <PaginationNumLight v-else-if="typeof page === 'number'" :buttonText="page.toString()" @click="setPage(page)" />
          <PaginationNumLight v-else-if="page === '-3'" class="ellipsis" button-text="..." @click="setPage(currentPage - 3)"></PaginationNumLight>
          <PaginationNumLight v-else-if="page === '+3'" class="ellipsis" button-text="..." @click="setPage(currentPage + 3)"></PaginationNumLight>
        </template>
        <PaginationNumLight buttonText="Next" :disabled="!hasNextPage" @click="nextPage" />
      </div>
    </div>
  </div>
  <Footer></Footer>
</template>

<style scoped>
.allStory {
  padding: 50px 90px;
  width: 100%;
}
.titleAllStory {
  font-family: "Playfair", serif;
  font-size: 40px;
  font-weight: bold;
}
.sortContainer {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.sort {
  display: flex;
  justify-content: space-between;
}
.sortBy,
.category {
  display: flex;
  align-items: center;
  margin-top: 30px;
  margin-right: 80px;
  width: 50%;
}
.titleSort {
  font-size: 20px;
  width: 70px;
}
.dropdown {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  width: 120px;
  padding: 10px;
  margin-left: 20px;
  border-radius: 4px;
  background-color: white;
  transition: border-color 0.3s;
}
.dropdown p {
  font-size: 20px;
  font-weight: 500;
}
.dropdown:hover {
  color: #466543;
}
.sortDDBy,
.sortDDCategory {
  position: absolute;
  background-color: white;
  border-radius: 4px;
  width: 150px;
  list-style-type: none;
  padding: 0;
  margin: 0;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.sortDDBy {
  margin-top: 280px;
  margin-left: 86.5px;
}
.sortDDCategory {
  margin-top: 580px;
  margin-left: 90px;
}
.sortDDBy li,
.sortDDCategory li {
  padding: 10px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 500;
}
.sortDDBy li:hover,
.sortDDCategory li:hover {
  color: #466543;
}
.selected {
  border-left: 3.5px solid #466543;
  background-color: #f0f0f0;
}
.fa-solid {
  margin-top: 6px;
  margin-left: 15px;
  font-size: 18px;
}
.inputContainer {
  position: relative;
  display: inline-block;
  margin-top: 25px;
}
.searchIndex {
  width: 350px;
  height: 60px;
  padding-left: 20px;
  border: 2px solid rgb(202, 202, 202);
  border-radius: 5px;
  font-size: 20px;
}
.searchIcon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 50px;
}
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 80px;
}
.pagination button:focus {
  outline: none;
  border: none;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .allStory {
    padding: 30px 40px;
  }
  
  .cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .sortContainer {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .allStory {
    padding: 20px;
  }
  
  .sortContainer {
    flex-direction: column;
  }
  
  .sort {
    flex-direction: column;
    width: 100%;
  }
  
  .sortBy,
  .category {
    margin-right: 0;
    width: 100%;
    margin-bottom: 20px;
  }
  
  .inputContainer {
    width: 100%;
  }
  
  .searchIndex {
    width: 100%;
  }
  
  .cards {
    grid-template-columns: 1fr;
  }
  
  .sortDDBy,
  .sortDDCategory {
    position: relative;
    margin: 10px 0;
    width: 100%;
  }
  
  .dropdown {
    width: calc(100% - 90px);
  }
}

@media (max-width: 480px) {
  .titleAllStory {
    font-size: 28px;
  }
  
  .titleSort {
    font-size: 16px;
    width: 60px;
  }
  
  .dropdown p {
    font-size: 16px;
  }
  
  .sortDDBy li,
  .sortDDCategory li {
    font-size: 16px;
    padding: 8px;
  }
  
  .searchIndex {
    height: 50px;
    font-size: 16px;
  }
}
</style>