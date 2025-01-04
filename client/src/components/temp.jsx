// // import { Carousel } from 'flowbite-react';
// // import 'flowbite/dist/flowbite.css';      
// // import React from 'react';
// // "use client";

// // const Temp = () => {
// //   return (
// //     <div className="relative h-56 sm:h-64 xl:h-80 2xl:h-96 overflow-hidden">
// //       <Carousel>
// //         <img className="absolute top-0 left-0 w-full h-full object-cover opacity-50" src="https://drfurithemes.com/farmart/wp-content/uploads/sites/18/2020/05/catalog_banner_full_1.jpg" alt="..." />
// //         <img className="absolute top-0 left-0 w-full h-full object-cover opacity-50" src="https://flowbite.com/docs/images/carousel/carousel-2.svg" alt="..." />
// //         <img className="absolute top-0 left-0 w-full h-full object-cover opacity-50" src="https://flowbite.com/docs/images/carousel/carousel-3.svg" alt="..." />
// //         <img className="absolute top-0 left-0 w-full h-full object-cover opacity-50" src="https://flowbite.com/docs/images/carousel/carousel-4.svg" alt="..." />
// //         <img className="absolute top-0 left-0 w-full h-full object-cover opacity-50" src="https://flowbite.com/docs/images/carousel/carousel-5.svg" alt="..." />
// //       </Carousel>
// //     </div>
// //   );
// // }

// // export default Temp;

// // jsx
// // import React, { useState } from 'react';
// // import CardComp from './CardComp';

// // const Temp = () => {
// //   const [currentImageIndex, setCurrentImageIndex] = useState(0);

// //   const images = [
// //     {
// //       src: 'https://m.media-amazon.com/images/I/7130x7c9NmL._SX3000_.jpg',
// //       alt: 'New year, now you',
// //     },
// //     {
// //       src: 'https://m.media-amazon.com/images/I/71VcGrxQRBL._SX3000_.jpg',
// //       alt: 'Image 2',
// //     },
// //     {
// //       src: 'https://via.placeholder.com/3000x1000?text=Image+3',
// //       alt: 'Image 3',
// //     },
// //   ];

// //   const goToPrevious = () => {
// //     setCurrentImageIndex((prevIndex) =>
// //       prevIndex === 0 ? images.length - 1 : prevIndex - 1
// //     );
// //   };

// //   const goToNext = () => {
// //     setCurrentImageIndex((prevIndex) =>
// //       prevIndex === images.length - 1 ? 0 : prevIndex + 1
// //     );
// //   };

// //   return (
// //     <>
// //     <div className="relative w-full">
// //       <div className="a-section a-spacing-none overflow-hidden">
// //         <div
// //           className="flex transition-transform duration-500 ease-in-out"
// //           style={{
// //             transform: `translateX(-${currentImageIndex * 100}%)`,
// //           }}
// //         >
// //           {images.map((image, index) => (
// //             <div key={index} className="relative w-full flex-shrink-0">
// //               <img
// //                 src={image.src}
// //                 alt={image.alt}
// //                 className="w-full h-auto object-cover"
// //                 data-a-hires={image.src}
// //               />
// //               <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //       <button
// //         onClick={goToPrevious}
// //         className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 focus:outline-none"
// //       >
// //         K
// //       </button>
// //       <button
// //         onClick={goToNext}
// //         className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 focus:outline-none"
// //       >
// //         J
// //       </button>
// //     </div>
// //     <CardComp/>
// //     </>
// //   );
// // };

// // export default Temp;

// import React, { useState, useEffect } from 'react';
// import CardComp from './CardComp';

// const Temp = () => {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024); // Check if tablet
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Check if mobile

//   useEffect(() => {
//     const handleResize = () => {
//       setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
//       setIsMobile(window.innerWidth < 768);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const images = isMobile ? [ // Use different images for mobile
//     {
//       src: 'https://firebasestorage.googleapis.com/v0/b/online-shopping-store-d90c0.appspot.com/o/1.jpg?alt=media&token=c066d4ca-83b1-4309-843e-104c3051b531',
//       alt: 'Mobile Image 1',
//     },
//     {
//       src: 'https://m.media-amazon.com/images/I/71VcGrxQRBL._SX3000_.jpg',
//       alt: 'Mobile Image 2',
//     },
//     {
//       src: 'https://m.media-amazon.com/images/I/71VcGrxQRBL._SX3000_.jpg',
//       alt: 'Mobile Image 3',
//     },
//   ] : [ // Default images for larger screens
//     {
//       src: 'https://m.media-amazon.com/images/I/7130x7c9NmL._SX3000_.jpg',
//       alt: 'New year, now you',
//     },
//     {
//       src: 'https://m.media-amazon.com/images/I/71VcGrxQRBL._SX3000_.jpg',
//       alt: 'Image 2',
//     },
//     {
//       src: 'https://via.placeholder.com/3000x1000?text=Image+3',
//       alt: 'Image 3',
//     },
//   ];

 

//   const goToPrevious = () => {
//     setCurrentImageIndex((prevIndex) =>
//       prevIndex === 0 ? images.length - 1 : prevIndex - 1
//     );
//   };

//   const goToNext = () => {
//     setCurrentImageIndex((prevIndex) =>
//       prevIndex === images.length - 1 ? 0 : prevIndex + 1
//     );
//   };

//   return (
//     <>
//       <div className="relative w-full h-auto ">  {/* px-2 */}
//         <div className="overflow-hidden">
//           <div
//             className="flex transition-transform duration-500 ease-in-out"
//             style={{
//               transform: `translateX(-${currentImageIndex * 100}%)`,
//             }}
//           >
//             {images.map((image, index) => (
//               <div key={index} className="relative w-full flex-shrink-0">
//                 <img
//                   src={image.src}
//                   alt={image.alt}
//                   className="w-full h-auto object-cover"
//                   data-a-hires={image.src}
//                 />
//                 <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-[#e3e6e6] to-transparent pointer-events-none"></div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <button
//           onClick={goToPrevious}
//           className={`absolute left-2 ${isMobile ? 'hidden' : 'top-[25%]'} -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 focus:outline-none md:left-4 ${isMobile ? 'left-1' : 'left-2'}`}
//         >
//           K
//         </button>
//         <button
//           onClick={goToNext}
//           className={`absolute right-2 ${isMobile ? 'hidden' : 'top-[25%]'} -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 focus:outline-none md:right-4 ${isMobile ? 'right-1' : 'right-2'}`}
//         >
//           J
//         </button>
//       </div>
      
//        <div className={`flex items-center justify-center flex-wrap h-auto bg-[#e3e6e6] overflow-hidden ${isMobile ? 'gap-1 flex-col mt-0' : `gap-4 mt-[-${isTablet ? '110' : '280'}px]`}`}>

//       <CardComp />
//       <CardComp />
//       <CardComp />
//       <CardComp />
//       <CardComp />
//       <CardComp />
//       <CardComp />
//       <CardComp />
//       </div> 
//     </>
//   );
// };

// export default Temp;

import React, { useState, useEffect } from 'react';
import CardComp from './CardComp';
import axios from 'axios';

const Temp = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [categoryProducts, setCategoryProducts] = useState({
    vegetable: [],
    'Home-Cooked Food': [],
    'Traditional-Pickles': [],
    'Seasonal Foods':[]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carousel images
  const images = isMobile ? [
    {
      src: 'https://m.media-amazon.com/images/I/71QRxZvKnGL._SX3000_.jpg',
      alt: 'Mobile Image 1',
    },
    {
      src: 'https://m.media-amazon.com/images/I/71U-Q+N7PXL._SX3000_.jpg',
      alt: 'Mobile Image 2',
    },
    {
      src: 'https://m.media-amazon.com/images/I/71PGQqyI8NL._SX3000_.jpg',
      alt: 'Mobile Image 3',
    },
  ] : [
    {
      src: 'https://m.media-amazon.com/images/I/7130x7c9NmL._SX3000_.jpg',
      alt: 'New year, now you',
    },
    {
      src: 'https://m.media-amazon.com/images/I/71VcGrxQRBL._SX3000_.jpg',
      alt: 'Image 2',
    },
    {
      src: 'https://m.media-amazon.com/images/I/61zAjw4bqPL._SX3000_.jpg',
      alt: 'Image 3',
    },
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products by category
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        const categories = ['vegetable', 'Home-Cooked Food','Traditional-Pickles','Seasonal Foods'];
        const productsData = {};

        for (const category of categories) {
          const response = await axios.get(`/api/products?category=${category}`);
          productsData[category] = response.data.products.slice(0, 4);
        }

        setCategoryProducts(productsData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProductsByCategory();
  }, []);

  // Carousel navigation functions
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <>
      {/* Carousel Section */}
      <div className="relative w-full h-auto">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentImageIndex * 100}%)`,
            }}
          >
            {images.map((image, index) => (
              <div key={index} className="relative w-full flex-shrink-0">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto object-cover"
                  data-a-hires={image.src}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-[#e3e6e6] to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className={`absolute left-2 ${isMobile ? 'hidden' : 'top-[25%]'} -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 focus:outline-none md:left-4 ${isMobile ? 'left-1' : 'left-2'}`}
        >
          ←
        </button>
        <button
          onClick={goToNext}
          className={`absolute right-2 ${isMobile ? 'hidden' : 'top-[25%]'} -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-50 hover:opacity-100 focus:outline-none md:right-4 ${isMobile ? 'right-1' : 'right-2'}`}
        >
          →
        </button>
      </div>

      {/* Products Section */}
      <div 
        className={`flex items-center justify-center flex-wrap h-auto bg-[#e3e6e6] overflow-hidden ${
          isMobile ? 'gap-1 flex-col mt-0' : `gap-4 mt-[-${isTablet ? '110' : '280'}px]`
        }`}
      >
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
          <div className={`flex relative items-center justify-center flex-wrap h-auto overflow-hidden mt-[]`}>
            {/* Vegetables Card */}
            <CardComp 
              title="Fresh Vegetables"
              products={categoryProducts.vegetable}
              category="vegetable"
            />
            
            {/* Home-Cooked Food Card */}
            <CardComp 
              title="Home-Cooked Food"
              products={categoryProducts['Home-Cooked Food']}
              category="Home-Cooked Food"
            />
            {/* Traditional-Pickles */}
            <CardComp 
              title="Traditional-Pickles"
              products={categoryProducts['Traditional-Pickles']}
              category="Traditional-Pickles"
            />
            <CardComp 
              title="Seasonal Foods"
              products={categoryProducts['Seasonal Foods']}
              category="Seasonal Foods"
            />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Temp;

