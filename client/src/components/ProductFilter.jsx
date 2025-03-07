import React, { useState, useEffect } from 'react';
import { FaFilter, FaStar } from 'react-icons/fa';

const ProductFilter = ({ onApplyFilter, initialFilters }) => {
    const [filters, setFilters] = useState({
        minPrice: initialFilters?.minPrice || '',
        maxPrice: initialFilters?.maxPrice || '',
        rating: initialFilters?.rating || '',
        sortBy: initialFilters?.sortBy || 'newest'
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const [priceRange, setPriceRange] = useState({
        min: initialFilters?.minPrice || 0,
        max: initialFilters?.maxPrice || 1000
    });

    useEffect(() => {
        if (initialFilters) {
            setFilters(initialFilters);
        }
    }, [initialFilters]);

    const handleFilterChange = (name, value) => {
        if (name === 'minPrice' || name === 'maxPrice') {
            // Ensure price is not negative
            const numValue = Math.max(0, Number(value));
            setFilters(prev => ({
                ...prev,
                [name]: numValue
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleApply = () => {
        // Validate and adjust price range
        let validatedFilters = { ...filters };

        // Convert price values to numbers
        const minPrice = Number(filters.minPrice);
        const maxPrice = Number(filters.maxPrice);

        // Validate price range
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            if (minPrice > maxPrice) {
                // Swap values if min is greater than max
                validatedFilters.minPrice = maxPrice;
                validatedFilters.maxPrice = minPrice;
            }
        }

        // Ensure prices are within valid range
        validatedFilters.minPrice = Math.max(0, Number(validatedFilters.minPrice));
        validatedFilters.maxPrice = Math.max(validatedFilters.minPrice, Number(validatedFilters.maxPrice));

        onApplyFilter(validatedFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            minPrice: '',
            maxPrice: '',
            rating: '',
            sortBy: 'newest'
        };
        setFilters(resetFilters);
        onApplyFilter(resetFilters);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <button 
                    className="md:hidden flex items-center gap-2 text-gray-600"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <FaFilter />
                    <span>Filters</span>
                </button>
                <h2 className="hidden md:block text-lg font-semibold">Filters</h2>
                <button
                    onClick={handleReset}
                    className="text-blue-600 text-sm hover:text-blue-800"
                >
                    Clear All
                </button>
            </div>

            <div className={`${isExpanded ? 'block' : 'hidden md:block'}`}>
                {/* Price Range */}
                <div className="mb-4">
                    <h3 className="font-medium mb-2">Price Range</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="w-1/2 p-2 border rounded"
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="w-1/2 p-2 border rounded"
                            min="0"
                        />
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-4">
                    <h3 className="font-medium mb-2">Minimum Rating</h3>
                    <div className="flex flex-wrap gap-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleFilterChange('rating', 
                                    filters.rating === star.toString() ? '' : star.toString()
                                )}
                                className={`flex items-center gap-1 p-2 rounded transition-colors
                                    ${filters.rating === star.toString()
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                            >
                                <FaStar className={filters.rating === star.toString() ? 'text-white' : 'text-yellow-400'} />
                                <span>{star}+ Stars</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div className="mb-4">
                    <h3 className="font-medium mb-2">Sort By</h3>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="newest">Newest</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating_high">Highest Rated</option>
                        <option value="most_sold">Most Sold</option>
                    </select>
                </div>

                <button
                    onClick={handleApply}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 
                             transition-colors duration-200"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default ProductFilter;