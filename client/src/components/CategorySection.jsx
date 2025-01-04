// components/CategorySection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaLeaf, FaPaintBrush, FaSpa, FaRecycle, 
         FaHeart, FaCarrot, FaPaw, FaSeedling, FaGift } from 'react-icons/fa';

const categories = [
  {
    id: 1,
    title: 'Home-Made Foods',
    ads: '12 Items',
    icon: <FaUtensils className="w-8 h-8" />,
    iconColor: 'text-amber-600',
    description: 'Authentic home-cooked'
  },
  {
    id: 2,
    title: 'Farm Fresh',
    ads: '15 Items',
    icon: <FaLeaf className="w-8 h-8" />,
    iconColor: 'text-green-600',
    description: 'Direct from local farms'
  },
  {
    id: 3,
    title: 'Handmade Crafts',
    ads: '20 Items',
    icon: <FaPaintBrush className="w-8 h-8" />,
    iconColor: 'text-purple-600',
    description: 'Artisanal crafted items'
  },
  {
    id: 4,
    title: 'Natural Beauty',
    ads: '08 Items',
    icon: <FaSpa className="w-8 h-8" />,
    iconColor: 'text-pink-600',
    description: 'Chemical-free beauty products'
  },
  {
    id: 5,
    title: 'Eco-Friendly Products',
    ads: '14 Items',
    icon: <FaRecycle className="w-8 h-8" />,
    iconColor: 'text-teal-600',
    description: 'Sustainable living essentials'
  },
  {
    id: 6,
    title: 'Traditional Wellness',
    ads: '10 Items',
    icon: <FaHeart className="w-8 h-8" />,
    iconColor: 'text-red-600',
    description: 'Ancient wellness wisdom'
  },
  {
    id: 7,
    title: 'Organic Pantry',
    ads: '18 Items',
    icon: <FaCarrot className="w-8 h-8" />,
    iconColor: 'text-orange-600',
    description: 'Pure organic ingredients'
  },
  {
    id: 8,
    title: 'Pet Care Natural',
    ads: '07 Items',
    icon: <FaPaw className="w-8 h-8" />,
    iconColor: 'text-blue-600',
    description: 'Natural pet care products'
  },
  {
    id: 9,
    title: 'Garden & Plants',
    ads: '16 Items',
    icon: <FaSeedling className="w-8 h-8" />,
    iconColor: 'text-emerald-600',
    description: 'Plants and gardening supplies'
  },
  {
    id: 10,
    title: 'Seasonal & Festive',
    ads: '11 Items',
    icon: <FaGift className="w-8 h-8" />,
    iconColor: 'text-yellow-600',
    description: 'Seasonal specialties'
  }
];

const CategorySection = () => {
  return (
    <section className="py-10 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Our <span className="relative">Categories</span>
            </h2>
            <p className="mt-2 text-gray-600">Discover Natural & Handcrafted Treasures</p>
          </div>
          <Link 
            to="/categories" 
            className="mt-4 sm:mt-0 px-5 py-2.5 relative rounded group overflow-hidden font-medium bg-green-50 text-green-600 inline-block"
          >
            <span className="absolute bottom-0 left-0 flex w-full h-0 mb-0 transition-all duration-200 ease-out transform translate-y-full bg-green-600 group-hover:h-full opacity-90"></span>
            <span className="relative group-hover:bg-red-500">View All</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="group"
            >
              <div 
                className="border rounded-lg p-4 transition-all duration-300
                  hover:shadow-lg hover:-translate-y-1 hover:scale-105 hover:bg-[#272F38] group-hover:text-white flex flex-col items-center"
              >
                <div 
                  className={`w-16 h-16 mb-2 flex items-center justify-center rounded-full 
                    ${category.iconColor} transition-transform group-hover:scale-110`}
                >
                  {category.icon}
                </div>
                <div className="text-center">
                  <h3 className="text-black font-medium mb-1 group-hover:text-white">{category.title}</h3>
                  <p className="text-sm text-gray-500 mb-2 group-hover:text-white">{category.description}</p>
                  <span 
                    className="inline-block px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 group-hover:bg-white group-hover:text-black"
                  >
                    {category.ads}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;