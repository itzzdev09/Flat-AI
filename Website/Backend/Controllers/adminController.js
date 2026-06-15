import FlatData from '../db/FlatModel.js';
import { getFilteredFlats } from '../db/localDataStore.js';
import { listUsers, setUserRole } from '../db/userStore.js';

const ensureMongo = () => {
  if (FlatData.db.readyState !== 1) {
    throw new Error('MongoDB is required for admin property management');
  }
};

const buildPropertyPayload = (input = {}) => ({
  PROP_ID: input.PROP_ID || `ADM-${Date.now()}`,
  PROPERTY_TYPE: input.PROPERTY_TYPE || 'Flat',
  SOCIETY_NAME: input.SOCIETY_NAME || 'New Listing',
  CITY: input.CITY || 'Kolkata',
  location: input.location || 'Kolkata',
  BEDROOM_NUM: Number(input.BEDROOM_NUM || 1),
  BALCONY_NUM: Number(input.BALCONY_NUM || 1),
  AREA: Number(input.AREA || 500),
  Price_per_sqft: Number(input.Price_per_sqft || 5000),
  PRICE: Number(input.PRICE || 0.5),
  AGE: input.AGE || 'New Property',
  FURNISH: input.FURNISH || 'Unfurnished',
  amenity_luxury: input.amenity_luxury || 'Low',
  FLOOR_NUM: input.FLOOR_NUM || '1',
  LATITUDE: Number(input.LATITUDE || 22.5726),
  LONGITUDE: Number(input.LONGITUDE || 88.3639),
  TOTAL_FLOOR: Number(input.TOTAL_FLOOR || 10),
  DESCRIPTION: input.DESCRIPTION || 'Added from the Flat AI admin portal.',
  Facing_Direction: input.Facing_Direction || 'North',
  Image: input.Image || 'https://cdn.pixabay.com/photo/2017/06/16/13/40/new-home-2409165_960_720.jpg',
  Situation: input.Situation || 'Ready To Move',
  Owner_Type: input.Owner_Type || 'Owner',
  Contact: input.Contact || '',
  Loan_Availability: Boolean(input.Loan_Availability),
  Estimated_Monthly_EMI: input.Estimated_Monthly_EMI ?? null,
  Maintenance_Fees: Number(input.Maintenance_Fees || 0),
  Property_Tax: Number(input.Property_Tax || 0),
  Stamp_Duty_Registration_Costs: Number(input.Stamp_Duty_Registration_Costs || 0),
  Nearest_Schools: input.Nearest_Schools || {},
  Nearest_Colleges: input.Nearest_Colleges || {},
  Nearest_Hospitals: input.Nearest_Hospitals || {},
  Nearest_Markets: input.Nearest_Markets || {},
  Nearest_Public_Transport: input.Nearest_Public_Transport || {},
  Nearest_Restaurants: input.Nearest_Restaurants || {},
  Nearest_Railway_Stations: input.Nearest_Railway_Stations || {},
  Nearest_Malls: input.Nearest_Malls || {},
  Swimming_Pool: Boolean(input.Swimming_Pool),
  Playground: Boolean(input.Playground),
  RERA_Registration_Number: Number(input.RERA_Registration_Number || 0),
  '24x7_Security': Boolean(input['24x7_Security']),
  Visitor_Parking: Boolean(input.Visitor_Parking),
  Intercom_Facility: Boolean(input.Intercom_Facility),
  Power_Backup: Boolean(input.Power_Backup),
  Water_Supply: input.Water_Supply || 'Municipal',
  Pet_Friendly: Boolean(input.Pet_Friendly),
  Fire_Safety_Installed: Boolean(input.Fire_Safety_Installed),
});

export const getAdminSummary = async (req, res) => {
  try {
    const [users, propertyCount] = await Promise.all([
      listUsers(),
      FlatData.db.readyState === 1
        ? FlatData.countDocuments()
        : getFilteredFlats().then((items) => items.length),
    ]);

    return res.status(200).json({
      users: users.length,
      properties: propertyCount,
      admins: users.filter((user) => (user.role || 'user') === 'admin').length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load admin summary', error: error.message });
  }
};

export const getUsers = async (_req, res) => {
  try {
    const users = await listUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load users', error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await setUserRole(id, role);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update role', error: error.message });
  }
};

export const getProperties = async (_req, res) => {
  try {
    if (FlatData.db.readyState !== 1) {
      const properties = await getFilteredFlats();
      return res.status(200).json(properties);
    }

    const properties = await FlatData.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(properties);
  } catch (error) {
    return res.status(503).json({ message: 'Property management requires MongoDB', error: error.message });
  }
};

export const createProperty = async (req, res) => {
  try {
    ensureMongo();
    const created = await FlatData.create(buildPropertyPayload(req.body));
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create property', error: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    ensureMongo();
    const updated = await FlatData.findByIdAndUpdate(req.params.id, buildPropertyPayload(req.body), {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update property', error: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    ensureMongo();
    const deleted = await FlatData.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.status(200).json({ message: 'Property deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete property', error: error.message });
  }
};
