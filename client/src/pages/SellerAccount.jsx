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

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../styles/sellerAccount.css';

const SellerAccount = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState({
    firstname: 'John',
    lastname: 'Doe',
    profilePhoto: '/placeholder-profile.jpg',
    description: 'Welcome to my store! I sell high-quality products.',
    socialMediaLinks: [{'facebook': 'https://www.facebook.com/'}, {'instagram': 'https://www.instagram.com/'}, {'twitter': 'https://www.twitter.com/'}, {'linkedin': 'https://www.linkedin.com/'}, {'youtube': 'https://www.youtube.com/'}],
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/users/sellers/${sellerId}`);
        setSeller(response.data.seller);
        setProducts(response.data.products);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch seller data');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  const filteredProducts = products.filter(product => {
    if (filter === 'best-selling') {
      return product.soldCount > 20; // Example condition for best-selling
    }
    return true; // Show all products for 'all' filter
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!seller) return <div>Seller not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <img
          src={seller.profilePhoto}
          alt={`${seller.firstname} ${seller.lastname}`}
          className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4 shadow-lg"
        />
        <h1 className="text-3xl font-bold mb-2">{seller.firstname} {seller.lastname}</h1>
        <div className="flex space-x-4 mb-4">
          {seller.socialMediaLinks && seller.socialMediaLinks.length > 0 ? (
            seller.socialMediaLinks.map((link) => (
              <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {link.platform}
              </a>
            ))
          ) : (
            <p>No social media links available.</p>
          )}
        </div>
        <p className="text-gray-600 text-center">{seller.description}</p>
      </div>

      <h2 className="text-xl font-semibold mb-4">Products:</h2>
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
      </div>
    </div>
  );
};

export default SellerAccount;