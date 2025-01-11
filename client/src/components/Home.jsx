import React from 'react';
import CategorySection from './CategorySection';
import ProductCatalog from './ProductCatalog';
import Temp from './temp';
import ProductSlider from './ProductSlider';


const Home = () => {
  return (
    <div className='bg-gray-200'>
      <div className="w-full relative">
        <Temp />
        <div className="relative z-10 p-4"> {/* Added padding for spacing */}
          {/* <h2 className="text-xl font-bold mb-4">Explore Categories</h2> */}
          {/* <CategorySection /> */}
          <ProductCatalog />
          <ProductSlider />
        </div>
      </div>
    </div>
  );
};

export default Home;