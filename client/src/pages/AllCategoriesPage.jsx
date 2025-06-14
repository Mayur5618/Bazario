import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AllCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState({});

  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        const response = await axios.get('/api/products/categories');
        
        if (response.data.success) {
          const uniqueCategories = response.data.categories;
          setCategories(uniqueCategories);

          const categoryDataPromises = uniqueCategories.map(async (category) => {
            try {
              const productsResponse = await axios.get('/api/products', {
                params: {
                  category,
                  limit: 1
                }
              });

              if (productsResponse.data.success) {
                const products = productsResponse.data.products;
                const totalProducts = productsResponse.data.total;
                
                if (products && products.length > 0) {
                  return {
                    category,
                    image: products[0].images[0],
                    productCount: totalProducts
                  };
                }
              }
            } catch (err) {
              console.error(`Error fetching products for ${category}:`, err);
            }
            return null;
          });

          const results = await Promise.all(categoryDataPromises);
          const categoryDataMap = {};
          results.forEach(result => {
            if (result) {
              categoryDataMap[result.category] = {
                image: result.image,
                productCount: result.productCount
              };
            }
          });

          setCategoryData(categoryDataMap);
        }
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p className="text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">No categories available</p>
      </div>
    );
  }

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">All Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(category)}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={categoryData[category]?.image || '/placeholder-image.jpg'}
                  alt={category}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent">
                <div className="absolute bottom-0 left-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl font-semibold text-white mb-2">{category}</h3>
                  <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {categoryData[category]?.productCount || 0} Products Available
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllCategoriesPage; 