import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Create or update wishlist
wishlistSchema.statics.createOrUpdateWishlist = async function(userId, productId) {
  const wishlist = await this.findOne({ user: userId });
  
  if (!wishlist) {
    return await this.create({
      user: userId,
      products: [productId]
    });
  }

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  
  return wishlist;
};

export default mongoose.model('Wishlist', wishlistSchema); 