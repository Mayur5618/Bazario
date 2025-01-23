import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CategoryProductsCatelog = () => {
    const products = [
        {
            id: 1,
            name: "PC Gaming",
            image: "https://via.placeholder.com/150",
        },
        {
            id: 2,
            name: "Xbox",
            image: "https://via.placeholder.com/150",
        },
        {
            id: 3,
            name: "PlayStation",
            image: "https://via.placeholder.com/150",
        },
        {
            id: 4,
            name: "Nintendo Switch",
            image: "https://via.placeholder.com/150",
        }
    ];

    return (
        <div className='w-[97%] mx-auto mt-5 flex justify-center items-center gap-1'>    
        <div className="max-w-[350px] mx-auto  bg-white p-4">
            <h2 className="text-2xl font-bold mb-4">Explore Categories</h2>
            
            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white hover:cursor-pointer">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_RpV_Nq_aND67ekZG9sOso6gv4AQatx2sw&s" alt={product.name} className="object-cover" />
                        <h3 className="text-sm">{product.name}</h3>
                    </div>
                ))}
            </div>
        </div>
        <div className="max-w-[350px] mx-auto  bg-white p-4">
            <h2 className="text-2xl font-bold mb-4">Explore Categories</h2>
            
            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white hover:cursor-pointer">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_RpV_Nq_aND67ekZG9sOso6gv4AQatx2sw&s" alt={product.name} className="object-cover" />
                        <h3 className="text-sm">{product.name}</h3>
                    </div>
                ))}
            </div>
        </div>
        <div className="max-w-[350px] mx-auto  bg-white p-4">
            <h2 className="text-2xl font-bold mb-4">Explore Categories</h2>
            
            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white hover:cursor-pointer">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_RpV_Nq_aND67ekZG9sOso6gv4AQatx2sw&s" alt={product.name} className="object-cover" />
                        <h3 className="text-sm">{product.name}</h3>
                    </div>
                ))}
            </div>
        </div>
        <div className="max-w-[350px] mx-auto  bg-white p-4">
            <h2 className="text-2xl font-bold mb-4">Explore Categories</h2>
            
            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-white hover:cursor-pointer">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_RpV_Nq_aND67ekZG9sOso6gv4AQatx2sw&s" alt={product.name} className="object-cover" />
                        <h3 className="text-sm">{product.name}</h3>
                    </div>
                ))}
            </div>
        </div>
        
        </div>
    );
};

export default CategoryProductsCatelog;