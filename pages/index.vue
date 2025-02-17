<template>
  <Header></Header>
  <div class="mainText">
    <h1 class="title" v-if="isAuthenticated()">Hi, {{ user.name }}.</h1>
    <h1 class="title">Welcome to Storytime</h1>
    <p class="subtitle">The world's most-loved social storytelling platform. Story time connects a global community of 9 million readers and writers through the power of story.</p>
    <div class="inputContainer">
      <input type="text" placeholder="Search story" class="searchIndex" v-model="searchQuery" @keyup.enter="handleSearch" />
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="searchIcon">
        <path
          d="M9.5 4a6.5 6.5 0 0 1 6.5 6.5c0 1.62-.59 3.1-1.57 4.23l5.65 5.65l-.71.71l-5.65-5.65A6.47 6.47 0 0 1 9.5 17A6.5 6.5 0 0 1 3 10.5A6.5 6.5 0 0 1 9.5 4m0 1A5.5 5.5 0 0 0 4 10.5A5.5 5.5 0 0 0 9.5 16a5.5 5.5 0 0 0 5.5-5.5A5.5 5.5 0 0 0 9.5 5"
        />
      </svg>
    </div>
    <div><img src="../assets/hero.png" alt="hero image" class="heroImage" /></div>
  </div>
  <div class="containerLatest">
    <IndexTitles titleText="Latest Stories" :exploreMore="true"></IndexTitles>
    <div class="d-flex cardLatestContainer">
      <CardsCard
        v-for="story in latestStories.slice(0, 6)"
        :key="story.id"
        :id="story.id"
        size="medium"
        :title="story.title"
        :description="story.content"
        :author="story.author_name"
        :author_img="story.author_image"
        :date="story.created_at"
        :image="story.cover"
        :category="story.category"
      />
    </div>
  </div>
  <div class="containerComedy">
    <IndexTitles titleText="Comedy" :exploreMore="true"></IndexTitles>
    <div class="cardComedyContainer">
      <div class="cardComedyLeft">
        <CardsCard
          v-if="comedyStories.length > 0"
          :id="comedyStories[0].id"
          size="large"
          :title="comedyStories[0].title"
          :description="comedyStories[0].content"
          :author="comedyStories[0].author_name"
          :author_img="comedyStories[0].author_image"
          :date="comedyStories[0].created_at"
          :image="comedyStories[0].cover"
          :category="allCategories[4].name"
        />
      </div>
      <div class="cardComedyRight">
        <CardsCard
          v-if="comedyStories.length > 1"
          :id="comedyStories[1].id"
          size="small"
          :title="comedyStories[1].title"
          :description="comedyStories[1].content"
          :author="comedyStories[1].author_name"
          :author_img="comedyStories[1].author_image"
          :date="comedyStories[1].created_at"
          :image="comedyStories[1].cover"
          :category="allCategories[4].name"
        />
        <CardsCard
          v-if="comedyStories.length > 2"
          :id="comedyStories[2].id"
          size="small"
          :title="comedyStories[2].title"
          :description="comedyStories[2].content"
          :author="comedyStories[2].author_name"
          :author_img="comedyStories[2].author_image"
          :date="comedyStories[2].created_at"
          :image="comedyStories[2].cover"
          :category="allCategories[4].name"
        />
      </div>
    </div>
  </div>
  <div class="containerRomance">
    <IndexTitles titleText="Romance" :exploreMore="true"></IndexTitles>
    <div class="cardRomanceContainer">
      <CardsCard
        v-for="story in romanceStories.slice(0, 3)"
        :key="story.id"
        :id="story.id"
        size="medium"
        :title="story.title"
        :description="story.content"
        :author="story.author_name"
        :author_img="story.author_image"
        :date="story.created_at"
        :image="story.cover"
        :category="allCategories[0].name"
      />
    </div>
  </div>
  <div class="containerHorror">
    <IndexTitles titleText="Horror" :exploreMore="true"></IndexTitles>
    <div class="cardHorrorContainer">
      <div class="cardComedyLeft">
        <CardsCard
          v-if="horrorStories.length > 0"
          :id="horrorStories[0].id"
          size="large"
          :title="horrorStories[0].title"
          :description="horrorStories[0].content"
          :author="horrorStories[0].author_name"
          :author_img="horrorStories[0].author_image"
          :date="horrorStories[0].created_at"
          :image="horrorStories[0].cover"
          :category="allCategories[2].name"
        />
      </div>
      <div class="cardComedyRight">
        <CardsCard
          v-if="horrorStories.length > 1"
          :id="horrorStories[1].id"
          size="small"
          :title="horrorStories[1].title"
          :description="horrorStories[1].content"
          :author="horrorStories[1].author_name"
          :author_img="horrorStories[1].author_image"
          :date="horrorStories[1].created_at"
          :image="horrorStories[1].cover"
          :category="allCategories[2].name"
        />
        <CardsCard
          v-if="horrorStories.length > 2"
          :id="horrorStories[2].id"
          size="small"
          :title="horrorStories[2].title"
          :description="horrorStories[2].content"
          :author="horrorStories[2].author_name"
          :author_img="horrorStories[2].author_image"
          :date="horrorStories[2].created_at"
          :image="horrorStories[2].cover"
          :category="allCategories[2].name"
        />
      </div>
    </div>
  </div>
  <div class="containerMoreCat">
    <IndexTitles titleText="More Categories" :exploreMore="false"></IndexTitles>
    <div class="cardMoreCatContainer">
      <CardsCardCat v-for="category in allCategories.slice(4, 10)" :key="category.id" :categories="category.name" @categorySelected="navigateToAllStories" />
    </div>
  </div>
  <br />
  <Footer></Footer>

  <ModalsToast 
    :message="toastMessage" 
    :type="'success'"
    v-model:is-visible="showToast"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchStoryById, fetchCategories, fetchNewestStories } from "~/store/fetchStory";
import { useAuth } from "~/store/auth";
import { useRouter } from "vue-router";
const router = useRouter();

// Define the Story interface
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

const { user, isAuthenticated } = useAuth();
const searchQuery = ref("");
const showToast = ref(false);
const toastMessage = ref("");

// Reactive variables to store fetched data
const latestStories = ref<Story[]>([]);
const comedyStories = ref<Story[]>([]);
const romanceStories = ref<Story[]>([]);
const horrorStories = ref<Story[]>([]);
const allCategories = ref<{ id: number; name: string }[]>([]);

// Fetch data when the component mounts
const fetchData = async () => {
  try {
    const categories = await fetchCategories();
    const newest = await fetchNewestStories();
    const comedy = await fetchStoryById(5);
    const romance = await fetchStoryById(1);
    const horror = await fetchStoryById(3);

    allCategories.value = categories;
    latestStories.value = newest;
    comedyStories.value = comedy;
    romanceStories.value = romance;
    horrorStories.value = horror;

    console.log(allCategories.value);
    console.log(allCategories.value.slice(4, 10));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchData();
  
  const storedToastMessage = localStorage.getItem('toastMessage');
  if (storedToastMessage) {
    toastMessage.value = storedToastMessage;
    showToast.value = true;
    localStorage.removeItem('toastMessage');
  }
});

const navigateToAllStories = (category: string) => {
  router.push({ name: "allStory", query: { category } });
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ 
      name: "allStory", 
      query: { 
        search: searchQuery.value,
        title: searchQuery.value // Add this for API compatibility
      } 
    });
  }
};
</script>

<style scoped>
.mainText {
  text-align: center;
  justify-items: center;
  margin-top: 50px;
}
.title {
  font-family: "Playfair", serif;
  font-size: 60px;
  text-shadow: 1px 3px 10px grey;
  font-weight: bolder;
}
.subtitle {
  font-size: 20px;
  width: 75%;
  align-content: center;
  color: rgb(66, 66, 66);
}
.inputContainer {
  position: relative;
  display: inline-block;
  margin-top: 25px;
}
.searchIndex {
  width: 850px;
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
.heroImage {
  width: 650px;
  margin: 25px;
}
.cardLatestContainer {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0px 90px;
}
.cardLatestContainer::-webkit-scrollbar {
  display: none;
}
.cardLatestContainer > * {
  flex: 0 0 auto;
}
.cardComedyContainer {
  display: flex;
  padding: 0px 90px;
}
.cardRomanceContainer {
  display: flex;
  justify-content: space-between;
  padding: 0px 90px;
}
.cardHorrorContainer {
  display: flex;
  padding: 0px 90px;
}
.cardMoreCatContainer {
  display: flex;
  margin-top: 20px;
  padding: 0px 90px;
}

@media (max-width: 1200px) {
  .searchIndex {
    width: 600px;
  }
  
  .cardLatestContainer,
  .cardComedyContainer,
  .cardRomanceContainer,
  .cardHorrorContainer,
  .cardMoreCatContainer {
    padding: 0 40px;
  }
  
  .title {
    font-size: 48px;
  }
}

@media (max-width: 768px) {
  .mainText {
    margin-top: 30px;
  }
  
  .title {
    font-size: 36px;
  }
  
  .subtitle {
    width: 90%;
    font-size: 18px;
  }
  
  .searchIndex {
    width: 90%;
    height: 50px;
    font-size: 16px;
  }
  
  .heroImage {
    width: 90%;
    margin: 15px;
  }
  
  .cardLatestContainer,
  .cardComedyContainer,
  .cardRomanceContainer,
  .cardHorrorContainer,
  .cardMoreCatContainer {
    padding: 0 20px;
    flex-direction: column;
  }
  
  .cardComedyLeft,
  .cardComedyRight {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 16px;
  }
  
  .searchIndex {
    height: 40px;
    font-size: 14px;
  }
}
</style>
