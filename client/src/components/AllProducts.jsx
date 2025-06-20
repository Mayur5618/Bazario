                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-lg p-3 w-full max-w-5xl"
                >
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-medium">Filters</h2>
                            <button onClick={handleReset} className="text-blue-600 text-xs hover:underline">
                                Reset All
                            </button>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ×
                        </button>
                    </div>

                    <div className="space-y-2">
                        {/* First Row - Price Range and Rating */}
                        <div className="flex gap-4 items-center">
                            {/* Price Range */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium">Price:</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <span>₹{priceRange[0]}</span>
                                        <span>-</span>
                                        <span>₹{priceRange[1]}</span>
                                    </div>
                                </div>
                                <div className="px-1">
                                    <Slider
                                        range
                                        min={0}
                                        max={5000}
                                        value={priceRange}
                                        onChange={(value) => setPriceRange(value)}
                                        className="h-2"
                                    />
                                </div>
                            </div>

                            {/* Ratings */}
                            <div className="w-48">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium">Rating:</span>
                                    <div className="flex gap-0.5">
                                        {[5, 4, 3, 2, 1].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => setLocalFilters(prev => ({ ...prev, ratings: rating }))}
                                                className={`flex items-center justify-center h-6 w-6 rounded ${
                                                    localFilters.ratings === rating
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                            >
                                                <span className="text-xs">{rating}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Second Row - Category, Sort and Apply */}
                        <div className="flex gap-2 items-center">
                            {/* Categories */}
                            <div className="w-1/3">
                                <select
                                    value={localFilters.category || 'all'}
                                    onChange={(e) => setLocalFilters(prev => ({ 
                                        ...prev, 
                                        category: e.target.value === 'all' ? null : e.target.value 
                                    }))}
                                    className="w-full h-8 px-2 border rounded text-xs"
                                >
                                    <option value="all">All Categories</option>
                                    {categories?.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="w-1/3">
                                <select
                                    value={localFilters.sortBy || ''}
                                    onChange={(e) => setLocalFilters(prev => ({ 
                                        ...prev, 
                                        sortBy: e.target.value || null
                                    }))}
                                    className="w-full h-8 px-2 border rounded text-xs"
                                >
                                    <option value="">Sort By</option>
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="most_sold">Most Sold</option>
                                </select>
                            </div>

                            {/* Apply Button */}
                            <button
                                onClick={handleApply}
                                className="w-1/3 h-8 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </motion.div> 