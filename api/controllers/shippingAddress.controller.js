import ShippingAddress from '../models/shippingAddress.model.js';

export const getShippingAddresses = async (req, res) => {
  try {
    const addresses = await ShippingAddress.find({ user: req.user._id });
    res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Error in getShippingAddresses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipping addresses'
    });
  }
};

export const addShippingAddress = async (req, res) => {
  try {
    const { name, email, street, city, state, pincode, phone } = req.body;

    // Validate required fields
    if (!name || !email || !street || !city || !state || !pincode || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const newAddress = new ShippingAddress({
      user: req.user._id,
      name,
      email,
      street,
      city,
      state,
      pincode,
      phone
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: 'Shipping address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Error in addShippingAddress:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding shipping address'
    });
  }
};

export const deleteShippingAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await ShippingAddress.findOneAndDelete({
      _id: addressId,
      user: req.user._id
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteShippingAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shipping address'
    });
  }
}; 