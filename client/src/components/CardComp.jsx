import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom'; // Import Link for routing

const CardComponent = ({ title, products, category }) => {
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!products || products.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <div className="grid grid-cols-1 gap-4" id="desktop-grid-1">
      <div
        className={`bg-white relative flex flex-col w-[355px] p-[20px_0px_20px] ${
          isMobile && "w-full p-[0px_0px_0px]"
        } ${isTablet && "w-[235px] p-[15px_0px_10px]"}`}
      >
        <div className={`a-cardui-head er block w-full pb-1 px-[20px] ${isMobile && "px-[15px]"}`}>
          <p className={`text-xl ${isTablet && "text-sm"}
            ${isMobile && "text-[18px] mt-[10px]"} font-semibold`}
          >
            {title}
          </p>
        </div>
        
        <div className={`mb-[44px] h-[303.7px] block w-full px-[20px] ${
          isTablet && "mb-[0px] h-auto px-[20px]"
        } ${isMobile && "mb-[0px] h-auto px-[15px]"}`}
        >
          <div className="flex flex-col w-full">
            {/* First Row */}
            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 2).map((product) => (
                // <div key={product._id} className="relative">
                //   <Link to={`/product/${product._id}`} className="block">
                //     <div className="overflow-hidden">
                //       <img
                //         src={product.images[0]}
                //         alt={product.name}
                //         className="w-[140px] bg-white h-[140px] object-cover"
                //       />
                //     </div>
                //     <p className="text-[10px] mt-[3px]">{product.name}</p>
                //     <p className="text-[10px] text-gray-600">₹{product.price}/{product.unitType}</p>
                //   </Link>
                // </div>
                // <div key={product._id} className="relative">
                //   <Link to={`/product/${product._id}`} className="block">
                //     <div className="relative overflow-hidden">
                //       <img
                //         src={product.images[0]}
                //         alt={product.name}
                //         className={`w-[140px] bg-white h-[140px] object-cover transition-all duration-300 ${
                //           product.stock <= 0 ? 'opacity-50' : ''
                //         }`}
                //       />
                //       {product.stock <= 0 && (
                //         <div className="absolute inset-0 flex items-center justify-center">
                //           <span className="bg-red-500 text-white px-2 py-1 rounded text-[10px]">
                //             Out of Stock
                //           </span>
                //         </div>
                //       )}
                //     </div>
                //     <p className="text-[10px] mt-[3px]">{product.name}</p>
                //     <div className="flex justify-between items-center">
                //       <p className="text-[10px] text-gray-600">₹{product.price}/{product.unitType}</p>
                //       {product.stock > 0 && (
                //         <p className="text-[8px] text-green-600">
                //           Stock: {product.stock}
                //         </p>
                //       )}
                //     </div>
                //   </Link>
                // </div>
                <div key={product._id} className="relative">
                <Link to={`/product/${product._id}`} className="block">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={`w-36 h-36 object-cover bg-white transition-opacity duration-300 
                        ${product.stock <= 0 ? "opacity-50 grayscale" : ""}`}
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] mt-2 text-gray-800">{product.name}</p>
                  <div className="flex justify-between items-center ">
                    <p className="text-[10px] text-gray-600">₹{product.price}/{product.unitType}</p>
                    {product.stock > 0 && (
                      <p className="text-[10px] pr-1 text-green-600">Stock: {product.stock}</p>
                    )}
                  </div>
                </Link>
              </div>
              ))}
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {products.slice(2, 4).map((product) => (
                // <div key={product._id} className="relative">
                //   <Link to={`/product/${product._id}`} className="block">
                //     <div className="overflow-hidden">
                //       <img
                //         src={product.images[0]}
                //         alt={product.name}
                //         className="w-[140px] bg-white h-[140px] object-cover"
                //       />
                //     </div>
                //     <p className="text-[10px] mt-[3px]">{product.name}</p>
                //     <p className="text-[10px] text-gray-600">₹{product.price}/{product.unitType}</p>
                //   </Link>
                // </div>
                <div key={product._id} className="relative">
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`w-[140px] bg-white h-[140px] object-cover transition-all duration-300 ${
                          product.stock <= 0 ? 'opacity-50 grayscale' : ''
                        }`}
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-[10px]">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] mt-[3px]">{product.name}</p>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-gray-600">₹{product.price}/{product.unitType}</p>
                      {product.stock > 0 && (
                        <p className="text-[10px] text-green-600 pr-1">
                          Stock: {product.stock}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`a-cardui-footer block w-full px-[20px] ${
          isTablet ? "mt-3" : "mt-6"
        } ${isMobile && "mt-[10px] mb-1"}`}
        >
          <Link 
            // to={`/products?category=${category}`}
            to={`/all-products?category=${category}`}
            className={`text-xs cursor-pointer text-blue-700 font-semibold ${
              isMobile && "text-[15px]"
            }`}
          >
            See more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardComponent;