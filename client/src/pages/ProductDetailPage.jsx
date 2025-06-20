import React, { useState } from 'react';
import { AiOutlineHeart } from "react-icons/ai";
import { BiShoppingBag } from "react-icons/bi";

const ProductDetailPage = () => {
  const productDetailItem = {
    images: [
      "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/2697787/pexels-photo-2697787.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/3910071/pexels-photo-3910071.jpeg?auto=compress&cs=tinysrgb&w=600",
    ],
    title: "Fujifilm X-T30 II",
    reviews: "37 customer reviews",
    availability: true,
    brand: "Fujifilm",
    category: "Camera",
    sku: "#FJX30II",
    price: 93000,
    previousPrice: 99999,
    description: "26.1MP APS-C X-Trans Sensor | Retro Style mirrorless Camera | 4k vlogging | High Speed Recording FHD 240fps.",
  };

  const [hoveredImage, setHoveredImage] = useState(productDetailItem.images[0]);

  return (
    <section className=" container  py-5 lg:grid lg:grid-cols-2">
      {/* Vertical Image Gallery */}
      <div className="flex place-items-center  ">
        <div className="flex flex-col space-y-2">
          {productDetailItem.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-14 h-14 object-cover cursor-pointer rounded-lg border border-gray-300 hover:opacity-75"
              onMouseEnter={() => setHoveredImage(image)}
            />
          ))}
        </div>
        <div className="relative w-full h-80 mb-4">
          <img src={hoveredImage} alt={productDetailItem.title} className="w-full h-full object-contain rounded-lg" />
        </div>
      </div>
      {/* Product Details */}
      <div className="mx-auto px-5 lg:px-5">
        <h2 className="pt-3 text-2xl font-bold lg:pt-0">{productDetailItem.title}</h2>
        <div className="mt-1">
          <p className="text-sm text-gray-400">({productDetailItem.reviews})</p>
        </div>
        <p className="mt-5 font-bold">
          Availability:{" "}
          {productDetailItem.availability ? (
            <span className="text-green-600">In Stock</span>
          ) : (
            <span className="text-red-600">Out of Stock</span>
          )}
        </p>
        <p className="font-bold">Brand: <span className="font-normal">{productDetailItem.brand}</span></p>
        <p className="font-bold">Category: <span className="font-normal">{productDetailItem.category}</span></p>
        <p className="font-bold">SKU: <span className="font-normal">{productDetailItem.sku}</span></p>
        <p className="mt-4 text-4xl font-bold text-violet-900">
          ₹{productDetailItem.price}{" "}
          <span className="text-xs text-gray-400 line-through">₹{productDetailItem.previousPrice}</span>
        </p>
        <p className="pt-5 text-sm leading-5 text-gray-500">{productDetailItem.description}</p>
        
        {/* Action Buttons */}
        <div className="mt-7 flex flex-row items-center gap-6">
          <button className="flex h-12 w-1/2 items-center justify-center bg-violet-900 text-white duration-100 hover:bg-blue-800">
            <BiShoppingBag className="mx-2" />
            Add to cart
          </button>
          <button className="flex h-12 w-1/2 items-center justify-center bg-amber-400 duration-100 hover:bg-yellow-300">
            <AiOutlineHeart className="mx-2" />
            Wishlist
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;