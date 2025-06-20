// import React, { useEffect, useState, useRef } from 'react';
// import Slider from 'react-slick';
// import axios from 'axios';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
// import '../styles/ProductSlider.css'; // Import custom CSS for styling

// const ProductSlider = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [bgColor, setBgColor] = useState('#f9f9f9'); // Default background color
//   const sliderRef = useRef(null); // Create a ref for the slider

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get('/api/products?category=vegetable'); // Use relative URL
//         setProducts(response.data.products); // Assuming response.data is an array of products
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         setError('Failed to load products.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const settings = {
//     dots: false, // Disable default dots
//     infinite: true,
//     speed: 500,
//     slidesToShow: 4, // Show 4 products
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     responsive: [
//       {
//         breakpoint: 1024,
//         settings: {
//           slidesToShow: 2,
//           slidesToScroll: 1,
//         },
//       },
//       {
//         breakpoint: 600,
//         settings: {
//           slidesToShow: 1,
//           slidesToScroll: 1,
//         },
//       },
//     ],
//   };

//   const handleMouseEnter = (color) => {
//     setBgColor(color); // Set background color based on product
//   };

//   const handleMouseLeave = () => {
//     setBgColor('#f9f9f9'); // Reset to default color
//   };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   if (error) {
//     return <div className="error">{error}</div>;
//   }

//   return (
//     <div className="product-slider" style={{ backgroundColor: bgColor }}>
//       <h2 className="text-2xl font-bold mb-4 text-center">Explore Our Fresh Products</h2>
//       <Slider ref={sliderRef} {...settings}>
//         {Array.isArray(products) && products.map(product => (
//           <div 
//             key={product._id} 
//             className="product-card"
//             onMouseEnter={() => handleMouseEnter('#e0f7fa')} // Example color for hover
//             onMouseLeave={handleMouseLeave}
//           >
//             <div className="product-image">
//               <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
//             </div>
//             <div className="product-info p-4">
//               <h3 className="text-lg font-semibold">{product.name}</h3>
//               <p className="text-gray-600">₹{product.price} per kg</p>
//               <p className="text-gray-500">{product.description}</p>
//               <button className="add-to-cart">Add to Cart</button>
//             </div>
//           </div>
//         ))}
//       </Slider>
//       <div className="slider-navigation">
//         <button className="nav-button prev" onClick={() => sliderRef.current.slickPrev()}>❮</button>
//         <button className="nav-button next" onClick={() => sliderRef.current.slickNext()}>❯</button>
//       </div>
//     </div>
//   );
// };

// export default ProductSlider;

//method 2
import React, { useEffect, useState, useRef } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import ColorThief from 'color-thief-browser';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/ProductSlider.css'; // Import custom CSS for styling

const ProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bgColor, setBgColor] = useState('rgba(249, 249, 249, 0.8)'); // Default background color
  const sliderRef = useRef(null); // Create a ref for the slider

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products?category=vegetable'); // Use relative URL
        setProducts(response.data.products); // Assuming response.data is an array of products
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const settings = {
    dots: false, // Disable default dots
    infinite: true,
    speed: 500,
    slidesToShow: 5, // Show 4 products
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    arrows: false, // Disable default arrows
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2, // Show 2 products on tablets
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1, // Show 1 product on mobile
          slidesToScroll: 1,
        },
      },
    ],
  };

  const handleMouseEnter = (imageUrl) => {
    const colorThief = new ColorThief();
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS if needed
    img.src = `https://api.allorigins.win/get?url=${encodeURIComponent(imageUrl)}`; // Use a different CORS proxy

    img.onload = () => {
      const dominantColor = colorThief.getColor(img);
      setBgColor(`rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.5)`); // Set background color with opacity
    };

    img.onerror = (event) => {
      console.error('Error loading image for color extraction:', event);
    };
  };

  const handleMouseLeave = () => {
    setBgColor('rgba(249, 249, 249, 0.8)'); // Reset to default color
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-slider" >
      <h2 className="text-2xl font-bold mb-4 text-center">Explore Our Fresh Products</h2>
      <Slider ref={sliderRef} {...settings}>
        {Array.isArray(products) && products.map(product => (
          <div 
            key={product._id} 
            className="product-card"
            onMouseEnter={() => handleMouseEnter(product.images[0])} // Use the first image for color extraction
            onMouseLeave={handleMouseLeave}
          >
            <div className="product-image">
              <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
            </div>
            <div className="product-info p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">₹{product.price} per kg</p>
              {/* <p className="text-gray-500">{product.description}</p> */}
              <button className="add-to-cart">Add to Cart</button>
            </div>
          </div>
        ))}
      </Slider>
      <div className="slider-navigation">
        <button className="nav-button prev" onClick={() => sliderRef.current.slickPrev()}>❮</button>
        <button className="nav-button next" onClick={() => sliderRef.current.slickNext()}>❯</button>
      </div>
    </div>
  );
};

export default ProductSlider;

//method 3
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const ProductSlider = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const response = await axios.get('/api/products');
//                 setProducts(response.data.products);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProducts();
//     }, []);

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="loader">Loading...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex overflow-x-scroll space-x-4 p-4">
//             {products.map(product => (
//                 <div key={product._id} className="min-w-[200px] bg-white rounded-lg shadow-md p-4">
//                     <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded-t-lg" />
//                     <h2 className="text-lg font-semibold">{product.name}</h2>
//                     <p className="text-gray-600">{product.description}</p>
//                     <p className="text-xl font-bold">${product.price}</p>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default ProductSlider;

//method 4
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const ProductSlider = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [currentIndex, setCurrentIndex] = useState(0);

//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const response = await axios.get('/api/products');
//                 setProducts(response.data.products);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProducts();
//     }, []);

//     const nextSlide = () => {
//         setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
//     };

//     const prevSlide = () => {
//         setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="loader">Loading...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="relative">
//             <div className="flex overflow-hidden">
//                 {products.map((product, index) => (
//                     <div
//                         key={product._id}
//                         className={`min-w-full transition-transform duration-500 ease-in-out transform ${
//                             index === currentIndex ? 'translate-x-0' : 'translate-x-full'
//                         }`}
//                     >
//                         <div className="bg-white rounded-lg shadow-md p-4">
//                             <img src={product.images[0]} alt={product.name} className="w-full h-32 object-cover rounded-t-lg" />
//                             <h2 className="text-lg font-semibold">{product.name}</h2>
//                             <p className="text-gray-600">{product.description}</p>
//                             <p className="text-xl font-bold">${product.price}</p>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <button
//                 onClick={prevSlide}
//                 className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition"
//             >
//                 &#10094; {/* Left Arrow */}
//             </button>
//             <button
//                 onClick={nextSlide}
//                 className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition"
//             >
//                 &#10095; {/* Right Arrow */}
//             </button>
//             <div className="flex justify-center mt-4">
//                 {products.map((_, index) => (
//                     <button
//                         key={index}
//                         onClick={() => setCurrentIndex(index)}
//                         className={`w-3 h-3 mx-1 rounded-full ${currentIndex === index ? 'bg-blue-600' : 'bg-gray-300'}`}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default ProductSlider;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const ProductSlider = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [currentIndex, setCurrentIndex] = useState(0);

//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const response = await axios.get('/api/products');
//                 setProducts(response.data.products);
//             } catch (error) {
//                 console.error('Error fetching products:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProducts();
//     }, []);

//     const nextSlide = () => {
//         setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
//     };

//     const prevSlide = () => {
//         setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length);
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="loader">Loading...</div>
//             </div>
//         );
//     }

//     return (
//         <div className="relative w-full max-w-4xl mx-auto">
//             <div className="flex overflow-hidden">
//                 {products.map((product, index) => (
//                     <div
//                         key={product._id}
//                         className={`min-w-full transition-transform duration-700 ease-in-out transform ${
//                             index === currentIndex ? 'translate-x-0' : 'translate-x-full'
//                         }`}
//                     >
//                         <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
//                             <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
//                             <h2 className="text-xl font-semibold text-center">{product.name}</h2>
//                             <p className="text-gray-600 text-center">{product.description}</p>
//                             <p className="text-xl font-bold mt-2">${product.price}</p>
//                             <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 transition">
//                                 Add to Cart
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//             <button
//                 onClick={prevSlide}
//                 className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition"
//             >
//                 &#10094; {/* Left Arrow */}
//             </button>
//             <button
//                 onClick={nextSlide}
//                 className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition"
//             >
//                 &#10095; {/* Right Arrow */}
//             </button>
//             <div className="flex justify-center mt-4">
//                 {products.map((_, index) => (
//                     <button
//                         key={index}
//                         onClick={() => setCurrentIndex(index)}
//                         className={`w-3 h-3 mx-1 rounded-full ${currentIndex === index ? 'bg-blue-600' : 'bg-gray-300'}`}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default ProductSlider;