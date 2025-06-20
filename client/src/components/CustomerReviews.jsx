import React from 'react';

const reviews = [
  { id: 1, name: 'John Doe', review: 'Great food and service!' },
  { id: 2, name: 'Jane Smith', review: 'Loved the home-cooked meals!' },
];

const CustomerReviews = () => {
  return (
    <div className="bg-gray-100 p-4 rounded">
      {reviews.map(review => (
        <div key={review.id} className="mb-2">
          <strong>{review.name}</strong>
          <p>{review.review}</p>
        </div>
      ))}
    </div>
  );
};

export default CustomerReviews; 