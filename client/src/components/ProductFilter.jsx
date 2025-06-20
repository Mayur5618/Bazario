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
        // Format filters to match the expected structure
        const formattedFilters = {
            priceRange: (filters.minPrice || filters.maxPrice) ? [
                Number(filters.minPrice) || 0,
                Number(filters.maxPrice) || 5000
            ] : null,
            ratings: filters.rating ? Number(filters.rating) : null,
            sortBy: filters.sortBy || null,
            platformType: 'b2c'
        };
        
        onApplyFilter(formattedFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            minPrice: '',
            maxPrice: '',
            rating: '',
            sortBy: 'newest'
        };
        setFilters(resetFilters);
        onApplyFilter({
            priceRange: null,
            ratings: null,
            sortBy: null,
            platformType: 'b2c'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                <button
                    onClick={handleReset}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* Row 1 */}
                {/* Price Range */}
                <div className="col-span-1">
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                            />
                        </div>
                        <span className="text-gray-500">-</span>
                        <div className="relative flex-1">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="col-span-1">
                    <h3 className="text-sm font-medium mb-2">Rating</h3>
                    <div className="flex flex-wrap gap-1">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleFilterChange('rating', 
                                    filters.rating === star.toString() ? '' : star.toString()
                                )}
                                className={`flex items-center gap-0.5 px-2 py-1 rounded text-sm transition-colors
                                    ${filters.rating === star.toString()
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                <FaStar className={filters.rating === star.toString() ? 'text-white' : 'text-yellow-400'} size={12} />
                                <span>{star}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div className="col-span-1">
                    <h3 className="text-sm font-medium mb-2">Sort By</h3>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full p-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating_high">Highest Rated</option>
                        <option value="most_sold">Most Sold</option>
                    </select>
                </div>

                {/* Row 2 */}
                <div className="col-span-3 mt-4">
                    <button
                        onClick={handleApply}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 
                                 transition-colors duration-200 text-sm font-medium"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;