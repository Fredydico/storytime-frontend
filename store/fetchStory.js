import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://157.245.193.94";

export const fetchStories = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add sort parameter
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }
    
    // Add title search parameter
    if (params.title) {
      queryParams.append('title', params.title);
    }

    // Add category parameter
    if (params.category) {
      queryParams.append('category', params.category);
    }

    const url = `${API_URL}/api/story${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url);
    return response.data.data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
};

export const fetchPopularStories = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/stories/popular`);
    return response.data.data.data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching popular stories:", error);
    return [];
  }
};

export const fetchNewestStories = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/stories/newest`);
    return response.data.data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching newest stories:", error);
    return [];
  }
};

export const fetchCategories = async () => { 
  try { 
    console.log(`${API_URL}/api/category`);

    const response = await axios.get(`${API_URL}/api/category`); 
    return response.data.data || []; // Ensure we always return an array
  } catch (error) { 
    console.error("Error fetching categories:", error); 
    return []; 
  } 
};

export const fetchStoryById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/category/${id}`);
    return response.data.data?.stories?.data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
};

export const fetchUserStory = async () => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(`${API_URL}/api/story-user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching stories: ", error);
    return [];
  }
};

export const fetchBookmarkStory = async () => {
  try {
    const token = Cookies.get("token");
    const response = await axios.get(`${API_URL}/api/bookmark-user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data?.data || []; // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching stories :", error);
    return [];
  }
};

export const uploadImage = async (files) => {
  const formData = new FormData();

  try {
    files.forEach((file) => {
      formData.append("files[]", file);
    });

    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.status === 200 ? response.data.data : null;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};

export const postStory = async (storyData) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    let urls = [];
    if (storyData.cover && storyData.cover.length > 0) {
      urls = await uploadImage(storyData.cover);
    }

    // Ensure urls is an array
    if (!Array.isArray(urls)) {
      urls = [];
    }

    const findFirstImage = urls.length > 0 ? urls[0] : '';

    const payload = {
      title: storyData.title,
      category_id: String(storyData.category_id), // Ensure category_id is a string
      content: storyData.content,
      cover: findFirstImage,
      images: urls.filter(image => image !== findFirstImage)
    };

    console.log('Sending payload:', payload); // Debug log

    const response = await axios.post(`${API_URL}/api/story`, payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.status === 201) {
      return response.data;
    }

    throw new Error(response.data?.message || "Failed to create story");
  } catch (error) {
    console.error("Error posting story:", error);
    throw error;
  }
};

export const fetchSingleStory = async (storyId) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.get(`${API_URL}/api/story/${storyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data?.status === 200) {
      return response.data.data;
    }

    throw new Error("Failed to fetch story");
  } catch (error) {
    console.error("Error fetching story:", error);
    throw error;
  }
};

export const updateStory = async (storyId, storyData) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    let urls = [];
    if (storyData.cover && storyData.cover.length > 0) {
      urls = await uploadImage(storyData.cover);
    }

    const payload = {
      title: storyData.title,
      category_id: String(storyData.category_id),
      content: storyData.content,
      cover: urls.length > 0 ? urls[0] : storyData.existingCover,
      images: urls.slice(1)
    };

    const response = await axios.put(`${API_URL}/api/story/${storyId}`, payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.status === 200) {
      return response.data;
    }

    throw new Error(response.data?.message || "Failed to update story");
  } catch (error) {
    console.error("Error updating story:", error);
    throw error;
  }
};

export const deleteStory = async (storyId) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.delete(`${API_URL}/api/stories/${storyId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data?.status === 200) {
      return true;
    }

    throw new Error(response.data?.message || "Failed to delete story");
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("Story not found");
    }
    console.error("Error deleting story:", error);
    throw error;
  }
};

// Check if a story is bookmarked by checking user's bookmarks
export const checkBookmarkStatus = async (storyId) => {
  try {
    const bookmarks = await fetchBookmarkStory();
    return bookmarks.some(bookmark => bookmark.story.id === storyId);
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
};

// Toggle bookmark status using a single endpoint
export const toggleBookmark = async (storyId) => {
  try {
    const token = Cookies.get("token");
    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.post(
      `${API_URL}/api/bookmark`,
      { story_id: storyId },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data?.status === 200;
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    throw error;
  }
};

export const fetchStoryDetail = async (storyId) => {
  try {

    const response = await axios.get(`${API_URL}/api/story/detail/${storyId}`);

    if (response.data?.status === 200) {
      return response.data.data;
    }

    throw new Error("Failed to fetch story details");
  } catch (error) {
    console.error("Error fetching story details:", error);
    throw error;
  }
};
