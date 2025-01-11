import React from 'react';

const promotions = [
  { id: 1, text: '20% off on your first order!' },
  { id: 2, text: 'Buy 1 Get 1 Free on select items!' },
];

const Promotions = () => {
  return (
    <div className="bg-yellow-100 p-4 rounded">
      {promotions.map(promo => (
        <p key={promo.id} className="text-lg font-semibold">
          {promo.text}
        </p>
      ))}
    </div>
  );
};

export default Promotions; 