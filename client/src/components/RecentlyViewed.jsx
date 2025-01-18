// import React, { useEffect, useState } from 'react';
// import './RecentlyViewed.css'; // Import the CSS file for styling

// const RecentlyViewed = ({ handleViewProduct }) => {
//   const [recentlyViewed, setRecentlyViewed] = useState([]);

//   useEffect(() => {
//     const viewedProducts = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
//     setRecentlyViewed(viewedProducts);
//   }, []);

//   const handleProductClick = (product) => {
//     handleViewProduct(product);
//   };

//   return (
//     <div className="recently-viewed">
//       <h2 className="text-2xl font-bold mb-4">Recently Viewed Products</h2>
//       <div className="flex overflow-x-auto space-x-4">
//         {recentlyViewed.length > 0 ? (
//           recentlyViewed.map(product => (
//             <div key={product._id} onClick={() => handleProductClick(product)} className="product-card">
//               <img src={product.images[0]} alt={product.name} className="product-image" />
//               <div className="product-info">
//                 <h3 className="product-name">{product.name}</h3>
//                 <p className="product-price">Price: ₹{product.price}</p>
//                 <p className="product-unit">Unit: {product.unitSize} {product.unitType}</p>
//                 <p className="product-rating">Rating: 🌟{product.rating} ({product.reviews} Reviews)</p>
//                 <p className="product-stock">Stock: {product.stock > 0 ? 'Available' : 'Out of Stock'}</p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>No recently viewed products.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RecentlyViewed;

// import React, { useEffect, useState } from 'react';
// import '../styles/recentlyViewed.css';

// const RecentlyViewed = ({ handleViewProduct }) => {
//   const [recentlyViewed, setRecentlyViewed] = useState([]);

//   useEffect(() => {
//     const viewedProducts = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
//     setRecentlyViewed(viewedProducts);
//   }, []);

//   const handleProductClick = (product) => {
//     handleViewProduct(product);
//   };

//   return (
//     <div className="p-6 bg-gray-50">
//       <h2 className="text-2xl font-bold mb-6 text-gray-700">Recently Viewed Products</h2>
//       <div className="flex space-x-6 overflow-x-auto">
//         {recentlyViewed.length > 0 ? (
//           recentlyViewed.map((product) => (
//             <div
//               key={product._id}
//               onClick={() => handleProductClick(product)}
//               className="flex-none w-64 bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-lg cursor-pointer"
//             >
//               <img
//                 src={product.images[0]}
//                 alt={product.name}
//                 className="h-40 w-full object-cover"
//               />
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold text-gray-800 truncate">
//                   {product.name}
//                 </h3>
//                 <p className="text-gray-600 text-sm mt-1">Price: ₹{product.price}</p>
//                 <p className="text-gray-600 text-sm">
//                   Unit: {product.unitSize} {product.unitType}
//                 </p>
//                 <p className="text-sm text-yellow-500 mt-1">
//                   🌟 {product.rating} ({product.reviews?.length || 0} Reviews)
//                 </p>
//                 <p
//                   className={`mt-2 text-sm font-medium ${
//                     product.stock > 0 ? 'text-green-600' : 'text-red-600'
//                   }`}
//                 >
//                   {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
//                 </p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-500">No recently viewed products.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RecentlyViewed;

import React, { useEffect, useState } from 'react';
import '../styles/recentlyViewed.css';

const RecentlyViewed = ({ handleViewProduct }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    const viewedProducts = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    setRecentlyViewed(viewedProducts);
  }, []);

  const handleProductClick = (product) => {
    handleViewProduct(product);
  };

  return (
    <div className="recently-viewed p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-700">Recently Viewed Products</h2>
      <div className="flex space-x-6 overflow-x-auto">
        {recentlyViewed.length > 0 ? (
          recentlyViewed.map((product) => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product)}
              className="product-card flex-none w-64 bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="product-image h-40 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="product-name text-lg font-semibold text-gray-800 truncate">
                  {product.name}
                </h3>
                <p className="product-price text-gray-600 text-sm mt-1">Price: ₹{product.price}</p>
                <p className="product-unit text-gray-600 text-sm">Unit: {product.unitSize} {product.unitType}</p>
                <p className="product-rating text-sm text-yellow-500 mt-1">
                  🌟 {product.rating} ({product.reviews?.length || 0} Reviews)
                </p>
                <p
                  className={`mt-2 text-sm font-medium ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No recently viewed products.</p>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;
