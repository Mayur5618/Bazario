// components/FeaturedListings.jsx
import React from 'react';

const FeaturedListings = () => {
  const listings = [
    {
      image: '/listing1.jpg',
      title: 'Luxury Restaurant',
      location: 'New York',
      rating: 4.5,
      reviews: 28
    },
    // Add more listings
  ];

  return (
    <section className="featured-listings">
      <div className="container">
        <h2>Featured Listings</h2>
        <div className="listings-grid">
          {listings.map((listing, index) => (
            <div key={index} className="listing-card">
              <img src={listing.image} alt={listing.title} />
              <div className="listing-content">
                <h3>{listing.title}</h3>
                <p>{listing.location}</p>
                <div className="rating">
                  <span>⭐ {listing.rating}</span>
                  <span>({listing.reviews} Reviews)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;