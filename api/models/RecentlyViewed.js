import mongoose from 'mongoose';

const recentlyViewedSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
}, {
  timestamps: true
});

// Keep only last 10 products
recentlyViewedSchema.pre('save', function(next) {
  if (this.products.length > 10) {
    this.products = this.products.slice(-10);
  }
  next();
});

export default mongoose.model('RecentlyViewed', recentlyViewedSchema); 