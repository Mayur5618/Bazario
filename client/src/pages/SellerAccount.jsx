// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// const SellerAccount = () => {
//   const { sellerId } = useParams();
//   const [seller, setSeller] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSellerData = async () => {
//       try {
//         const response = await axios.get(`/api/users/sellers/${sellerId}`);
//         setSeller(response.data.seller);
//         setProducts(response.data.products);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch seller data');
//         setLoading(false);
//       }
//     };

//     fetchSellerData();
//   }, [sellerId]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!seller) return <div>Seller not found</div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-4">{seller.firstname} {seller.lastname}</h1>
//       <h2 className="text-xl mb-2">Products:</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {products.map(product => (
//           <div key={product._id} className="border p-4 rounded">
//             <h3 className="font-semibold">{product.name}</h3>
//             <p>Price: ₹{product.price}</p>
//             <p>Sold: {product.soldCount}</p>
//             <a href={`/products/${product._id}`} className="text-blue-500">View Product</a>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SellerAccount;

// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import '../styles/sellerAccount.css';

// const SellerAccount = () => {
//   const { sellerId } = useParams();
//   const [seller, setSeller] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchSellerData = async () => {
//       try {
//         const response = await axios.get(`/api/users/sellers/${sellerId}`);
//         setSeller(response.data.seller);
//         setProducts(response.data.products);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch seller data');
//         setLoading(false);
//       }
//     };

//     fetchSellerData();
//   }, [sellerId]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!seller) return <div>Seller not found</div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col items-center mb-8">
//         <img
//           src={seller.profilePhoto || "C:/Users/Mayur/AppData/Local/Microsoft/Windows/INetCache/IE/1HQOCL9S/099e5126dde8484b9a731bdce0cafdb5[1].jpg"} // Placeholder for profile photo
//           alt={`${seller.firstname} ${seller.lastname}`}
//           className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4"
//         />
//         <h1 className="text-3xl font-bold mb-2">{seller.firstname} {seller.lastname}</h1>
//         <div className="flex space-x-4 mb-4">
//           {seller.socialMediaLinks && seller.socialMediaLinks.map(link => (
//             <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//               {link.platform}
//             </a>
//           ))}
//         </div>
//         <p className="text-gray-600">{seller.description || 'No description available.'}</p>
//       </div>

//       <h2 className="text-xl font-semibold mb-4">Products:</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {products.map(product => (
//           <div key={product._id} className="border rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
//             <img
//               src={product.images[0] || '/placeholder-product.jpg'} // Placeholder for product image
//               alt={product.name}
//               className="w-full h-48 object-cover"
//             />
//             <div className="p-4">
//               <h3 className="font-semibold text-lg">{product.name}</h3>
//               <p className="text-gray-700">Price: ₹{product.price}</p>
//               <p className="text-gray-600">Sold: {product.soldCount}</p>
//               <a href={`/products/${product._id}`} className="text-blue-500 hover:underline">View Product</a>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SellerAccount;

//best
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';
// import '../styles/sellerAccount.css';

// const SellerAccount = () => {
//   const { sellerId } = useParams();
//   const [seller, setSeller] = useState({
//     firstname: 'John',
//     lastname: 'Doe',
//     profilePhoto: '/placeholder-profile.jpg',
//     description: 'Welcome to my store! I sell high-quality products.',
//     socialMediaLinks: [{'facebook': 'https://www.facebook.com/'}, {'instagram': 'https://www.instagram.com/'}, {'twitter': 'https://www.twitter.com/'}, {'linkedin': 'https://www.linkedin.com/'}, {'youtube': 'https://www.youtube.com/'}],
//   });
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all');

//   useEffect(() => {
//     const fetchSellerData = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(`/api/users/sellers/${sellerId}`);
//         setSeller(response.data.seller);
//         setProducts(response.data.products);
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to fetch seller data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSellerData();
//   }, [sellerId]);

//   const filteredProducts = products.filter(product => {
//     if (filter === 'best-selling') {
//       return product.soldCount > 20; // Example condition for best-selling
//     }
//     return true; // Show all products for 'all' filter
//   });

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!seller) return <div>Seller not found</div>;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* <div className="bg-gray-200 p-4 rounded-lg  mb-8">
//         <img
//           // src={seller.profilePhoto}
//           src="https://firebasestorage.googleapis.com/v0/b/online-shopping-store-d90c0.appspot.com/o/Screenshot%20(225).png?alt=media&token=d651ae47-4a3a-474b-85ef-1c5fa5c9d8cd"
//           alt={`${seller.firstname} ${seller.lastname}`}
//           className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 shadow-lg"
//         />
//         <h1 className="text-3xl font-bold mb-2">{seller.firstname} {seller.lastname}</h1>
//         <div className="flex space-x-4 mb-4">
//           {seller.socialMediaLinks && seller.socialMediaLinks.length > 0 ? (
//             seller.socialMediaLinks.map((link) => (
//               <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//                 {link.platform}
//               </a>
//             ))
//           ) : (
//            <></>
//           )}
//         </div>
//         <p className="text-gray-600 text-center">"Homemade Flavors, Heartfelt Cooking"</p>
//       </div> */}
//       <div className="grid grid-cols-3 gap-4 bg-gray-200 p-4 rounded-lg mb-8">
//     <div className="flex flex-col items-center">
//         <img
//             src="https://firebasestorage.googleapis.com/v0/b/online-shopping-store-d90c0.appspot.com/o/Screenshot%20(225).png?alt=media&token=d651ae47-4a3a-474b-85ef-1c5fa5c9d8cd"
//             alt={`${seller.firstname} ${seller.lastname}`}
//             className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 shadow-lg"
//         />
//     </div>
//     <div className="flex flex-col justify-center">
//         <h1 className="text-3xl font-bold mb-2">{seller.firstname} {seller.lastname}</h1>
//         <h2>Mobile:8140023599</h2>
//         <h2>Address:18-B,Jamsedh nagar,sachin,surat</h2>
//         <h2>Seller Rating:★★★★☆(100 reviews)</h2>
//         <h2>Category: Home Made Food</h2>
//         <div className="flex space-x-4 mb-4">
//             {seller.socialMediaLinks && seller.socialMediaLinks.length > 0 ? (
//                 seller.socialMediaLinks.map((link) => (
//                     <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//                         {link.platform}
//                     </a>
//                 ))
//             ) : (
//                 <></>
//             )}
//         </div>
//     </div>
//     <div className="flex flex-col justify-center">
//         {/* Empty column for future use or spacing */}
//     </div>
// </div>

{
  /* <h2 className="text-xl font-semibold mb-4">Products:</h2>
      <div className="mb-4">
        <label className="mr-2">Filter by:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Products</option>
          <option value="best-selling">Best Selling</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product._id} className="border rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover transition-transform duration-300 ease-in-out"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-700">Price: ₹{product.price}</p>
                <p className="text-gray-600">Sold: {product.soldCount}</p>
                <a href={`/products/${product._id}`} className="text-blue-500 hover:underline">View Product</a>
              </div>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div> */
}
{
  /* </div>
  );
};

export default SellerAccount; */
}

// src/pages/SellerAccount.jsx
// import React, { useState } from 'react';

// const SellerAccount = () => {
//   const seller = {
//     firstname: 'Jane',
//     lastname: 'Doe',
//     profilePhoto: '/placeholder-profile.jpg',
//     description: 'Welcome to my store! I offer a variety of high-quality products.',
//     socialMediaLinks: [
//       { platform: 'Facebook', url: 'https://www.facebook.com/' },
//       { platform: 'Instagram', url: 'https://www.instagram.com/' },
//       { platform: 'Twitter', url: 'https://www.twitter.com/' },
//     ],
//     story: 'I started my journey in the world of e-commerce to share my passion for quality products. My goal is to provide the best for my customers.',
//   };

//   const products = [
//     {
//       id: 1,
//       name: 'Product 1',
//       price: 100,
//       soldCount: 30,
//       totalReviews: 25,
//       starRating: 4.5,
//       image: '/images/product1.jpg',
//     },
//     {
//       id: 2,
//       name: 'Product 2',
//       price: 200,
//       soldCount: 20,
//       totalReviews: 15,
//       starRating: 4.0,
//       image: '/images/product2.jpg',
//     },
//     {
//       id: 3,
//       name: 'Product 3',
//       price: 150,
//       soldCount: 10,
//       totalReviews: 5,
//       starRating: 3.5,
//       image: '/images/product3.jpg',
//     },
//   ];

//   const upcomingProducts = [
//     {
//       id: 4,
//       name: 'Upcoming Product 1',
//       releaseDate: '2023-12-01',
//       image: '/images/upcoming-product1.jpg',
//     },
//     {
//       id: 5,
//       name: 'Upcoming Product 2',
//       releaseDate: '2023-12-15',
//       image: '/images/upcoming-product2.jpg',
//     },
//   ];

//   const [searchTerm, setSearchTerm] = useState('');

//   const filteredProducts = products.filter(product =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="bg-gray-200 p-4 rounded-lg flex flex-col items-center mb-8">
//         <img
//           src={seller.profilePhoto}
//           alt={`${seller.firstname} ${seller.lastname}`}
//           className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 shadow-lg"
//         />
//         <h1 className="text-3xl font-bold mb-2">{seller.firstname} {seller.lastname}</h1>
//         <p className="text-gray-600 text-center">{seller.description}</p>
//         <div className="flex space-x-4 mb-4">
//           {seller.socialMediaLinks.map(link => (
//             <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//               {link.platform}
//             </a>
//           ))}
//         </div>
//       </div>

//       <h2 className="text-xl font-semibold mb-4">Search Products:</h2>
//       <input
//         type="text"
//         placeholder="Search for products..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="border rounded p-2 mb-4 w-full"
//       />

//       <h2 className="text-xl font-semibold mb-4">Trending Products:</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map(product => (
//             <div key={product.id} className="border rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-48 object-cover transition-transform duration-300 ease-in-out"
//               />
//               <div className="p-4">
//                 <h3 className="font-semibold text-lg">{product.name}</h3>
//                 <p className="text-gray-700">Price: ₹{product.price}</p>
//                 <p className="text-gray-600">Sold: {product.soldCount}</p>
//                 <p className="text-gray-600">Total Reviews: {product.totalReviews}</p>
//                 <p className="text-yellow-500">Rating: {product.starRating} ★</p>
//                 <a href={`/products/${product.id}`} className="text-blue-500 hover:underline">View Product</a>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-600">No products found.</p>
//         )}
//       </div>

//       <h2 className="text-xl font-semibold mb-4 mt-8">Upcoming Products:</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {upcomingProducts.map(product => (
//           <div key={product.id} className="border rounded-lg shadow-lg overflow-hidden">
//             <img
//               src={product.image}
//               alt={product.name}
//               className="w-full h-48 object-cover"
//             />
//             <div className="p-4">
//               <h3 className="font-semibold text-lg">{product.name}</h3>
//               <p className="text-gray-600">Release Date: {product.releaseDate}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <h2 className="text-xl font-semibold mb-4 mt-8">Seller's Story:</h2>
//       <p className="text-gray-600">{seller.story}</p>
//     </div>
//   );
// };

// export default SellerAccount;

// src/pages/SellerAccount.jsx
// import React, { useState } from 'react';

// const SellerAccount = () => {
//   const seller = {
//     firstname: 'Jane',
//     lastname: 'Doe',
//     profilePhoto: '/placeholder-profile.jpg',
//     description: 'Welcome to my store! I offer a variety of high-quality products.',
//     socialMediaLinks: [
//       { platform: 'Facebook', url: 'https://www.facebook.com/' },
//       { platform: 'Instagram', url: 'https://www.instagram.com/' },
//       { platform: 'Twitter', url: 'https://www.twitter.com/' },
//     ],
//     story: 'I started my journey in the world of e-commerce to share my passion for quality products. My goal is to provide the best for my customers.',
//   };

//   const products = [
//     {
//       id: 1,
//       name: 'Product 1',
//       price: 100,
//       soldCount: 30,
//       totalReviews: 25,
//       starRating: 4.5,
//       image: '/images/product1.jpg',
//     },
//     {
//       id: 2,
//       name: 'Product 2',
//       price: 200,
//       soldCount: 20,
//       totalReviews: 15,
//       starRating: 4.0,
//       image: '/images/product2.jpg',
//     },
//     {
//       id: 3,
//       name: 'Product 3',
//       price: 150,
//       soldCount: 10,
//       totalReviews: 5,
//       starRating: 3.5,
//       image: '/images/product3.jpg',
//     },
//   ];

//   const [searchTerm, setSearchTerm] = useState('');

//   const filteredProducts = products.filter(product =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Seller Profile Section */}
//       <div className="bg-gray-200 p-4 rounded-lg flex flex-col items-center mb-8">
//         <img
//           src={seller.profilePhoto}
//           alt={`${seller.firstname} ${seller.lastname}`}
//           className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 shadow-lg"
//         />
//         <h1 className="text-3xl font-bold mb-2">{seller.firstname} {seller.lastname}</h1>
//         <div className="flex items-center mb-2">
//           <span className="text-yellow-500">★★★★☆</span>
//           <span className="ml-2 text-gray-600">({seller.totalReviews} reviews)</span>
//         </div>
//         <p className="text-gray-600 text-center">{seller.description}</p>
//         <div className="flex space-x-4 mb-4">
//           {seller.socialMediaLinks.map(link => (
//             <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//               {link.platform}
//             </a>
//           ))}
//         </div>
//       </div>

//       {/* Search Products Section */}
//       <h2 className="text-xl font-semibold mb-4">Search Products:</h2>
//       <input
//         type="text"
//         placeholder="Search for products..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="border rounded p-2 mb-4 w-full"
//       />

//       {/* For You Section */}
//       <h2 className="text-xl font-semibold mb-4">For You:</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map(product => (
//             <div key={product.id} className="border rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105">
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-48 object-cover transition-transform duration-300 ease-in-out"
//               />
//               <div className="p-4">
//                 <h3 className="font-semibold text-lg">{product.name}</h3>
//                 <p className="text-gray-700">Price: ₹{product.price}</p>
//                 <p className="text-gray-600">Sold: {product.soldCount}</p>
//                 <p className="text-yellow-500">Rating: {product.starRating} ★</p>
//                 <button className="mt-2 bg-blue-500 text-white rounded px-4 py-2">Add to Cart</button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-600">No products found.</p>
//         )}
//       </div>

//       {/* Most Loved Section */}
//       <h2 className="text-xl font-semibold mb-4">Most Loved:</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         {/* Add similar product cards for most loved products */}
//       </div>

//       {/* Coming Soon Section */}
//       <h2 className="text-xl font-semibold mb-4">Coming Soon:</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         {/* Add similar product cards for upcoming products */}
//       </div>

//       {/* Seller's Story Section */}
//       <h2 className="text-xl font-semibold mb-4">Seller's Story:</h2>
//       <p className="text-gray-600">{seller.story}</p>
//     </div>
//   );
// };

// export default SellerAccount;





import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {motion} from "framer-motion"
import '../styles/SellerAccount.css';

const SellerAccount = () => {
  const { sellerId } = useParams();

  const [seller, setSeller] = useState({
    firstname: "John",
    lastname: "Doe",
    profilePhoto: "/placeholder-profile.jpg",
    description: "Welcome to my store! I sell high-quality products.",
    socialMediaLinks: [
      { platform: "Facebook", url: "https://www.facebook.com/" },
      { platform: "Instagram", url: "https://www.instagram.com/" },
      { platform: "Twitter", url: "https://www.twitter.com/" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/" },
      { platform: "YouTube", url: "https://www.youtube.com/" },
    ],
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/users/sellers/${sellerId}`);
        setSeller(response.data.seller);
        setProducts(response.data.products);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch seller data");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  const filteredProducts = products.filter((product) => {
    if (filter === "best-selling") {
      return product.soldCount > 20; // Example condition for best-selling
    }
    return true; // Show all products for 'all' filter
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!seller) return <div>Seller not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-4 bg-gray-200 p-6 rounded-lg shadow-lg mb-8">
        <div className="flex flex-col items-center">
          <img
            // src={seller.profilePhoto}
            src="https://firebasestorage.googleapis.com/v0/b/online-shopping-store-d90c0.appspot.com/o/Screenshot%20(225).png?alt=media&token=d651ae47-4a3a-474b-85ef-1c5fa5c9d8cd"
            alt={`${seller.firstname} ${seller.lastname}`}
            className="w-48 h-48 rounded-full border-4 border-blue-500 mb-4 shadow-lg"
          />
        </div>
        <div className="flex  flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            {seller.firstname} {seller.lastname}
          </h1>
          <h2 className="text-base text-gray-600 mb-1">
            Mobile:{" "}
            <span className="font-semibold">{seller.mobile}8140023599</span>
          </h2>
          <h2 className="text-base text-gray-600 mb-1">
            Address: <span className="font-semibold">{seller.address}</span>
          </h2>
          <h2 className="text-base text-gray-600 mb-1">
            Seller Rating:{" "}
            <span className="text-yellow-500">{seller.rating}</span> (100
            reviews)
          </h2>
          <h2 className="text-base text-gray-600 mb-4">
            Category: <span className="font-semibold">Home Made Food</span>
          </h2>
          <div className="flex space-x-4 mb-4">
            {seller.socialMediaLinks && seller.socialMediaLinks.length > 0 ? (
              seller.socialMediaLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {link.platform}
                </a>
              ))
            ) : (
              <span className="text-gray-500">
                No social media links available
              </span>
            )}
          </div>
        </div>
        <div className="flex  flex-col justify-center">
          {/* Empty column for future use or spacing */}
        </div>
        <div className="flex col-span-3">
        <Link to="/">
  <p className="font-semibold text-gray-800 ml-28 hover:text-blue-500 relative group">
    Home
    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
  </p>
</Link>

<Link to="/">
  <p className="font-semibold text-gray-800 ml-14 hover:text-blue-500 relative group">
    Most Loved
    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
  </p>
</Link>

<Link to="/">
  <p className="font-semibold text-gray-800 ml-14 hover:text-blue-500 relative group">
    Coming Soon
    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
  </p>
</Link>

<Link to="/">
  <p className="font-semibold text-gray-800 ml-14 hover:text-blue-500 relative group">
    Seller's Story
    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
  </p>
</Link>

        </div>
      </div>

      {/* Products Section */}
      {/* <h2 className="text-xl font-semibold mb-4">Products:</h2> */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="border p-2 bg-green-500 rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="mx-auto w-56 h-56 object-contain transition-transform duration-300 ease-in-out"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-gray-700">Price: ₹{product.price}</p>
                <p className="text-gray-600">Sold: {product.soldCount}</p>
                <a
                  href={`/products/${product._id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Product
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div> */}

<h2 className="text-xl font-semibold  mb-4">Products:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            // <div
            //   key={product._id}
            //   className="bg-white border border-[#E0E0E0] p-2 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            // >
            //   {/* Product Image */}
            //   <Link to={`/product/${product._id}`}>
            //     <div className="overflow-hidden">
            //       <img
            //         src={product.images[0]}
            //         alt={product.name}
            //         className="h-68 w-68 mx-auto object-cover hover:scale-105 transition-transform duration-300"
            //       />
            //     </div>
            //   </Link>

            //   {/* Product Details */}
            //   <div className="p-4">
            //     {/* Product Name */}
            //     <Link to={`/product/${product._id}`}>
            //       <h3 className="text-lg font-medium text-gray-800 mb-2">
            //         {product.name}
            //       </h3>
            //     </Link>

            //     {/* Price and Unit Section */}
            //     <div className="flex items-center justify-between mb-4">
            //       <div>
            //         <span className="text-xl font-bold">₹{product.price}</span>
            //         <span className="text-sm text-gray-500 ml-2">
            //           Sold: {product.soldCount}
            //         </span>
            //       </div>
            //     </div>

            //     {/* View Product Button */}
            //     <Link
            //       to={`/products/${product._id}`}
            //       className="text-blue-500 hover:underline"
            //     >
            //       View Product
            //     </Link>
            //   </div>
            // </div>

            <div className="product-card bg-white border border-[#E0E0E0] rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
  <Link to={`/product/${product._id}`}>
    <img
      src={product.images[0]} // Ensure this is the correct path to the image
      alt={product.name}
      className="w-full h-52 object-cover" // Adjust height as needed
    />
  </Link>
  <div className="p-4 bg-gray-200">
    <Link to={`/product/${product._id}`}>
      <h3 className=" font-medium text-gray-800 mb-2 product-name">{product.name}</h3>
    </Link>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold">₹{product.price}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    per {product.unitSize} {product.unitType}
                  </span>
                </div>
              </div>
    </div>
    <Link to={`/products/${product._id}`} className="text-blue-500 hover:underline">
      View Product
    </Link>
  </div>
</div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

export default SellerAccount;
