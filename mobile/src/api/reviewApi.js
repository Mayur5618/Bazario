export const getProductReviewsPaginated = async (productId, page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/api/reviews/products/${productId}/reviews/paginated?page=${page}&limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}; 