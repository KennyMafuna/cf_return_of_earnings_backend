const mongoose = require('mongoose');
const { Schema } = mongoose;

const PermissionsSchema = new Schema({}, { strict: false });

const AdminUserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  permissions: { type: PermissionsSchema, default: {} },
  lastLogin: { type: Date },
}, {
  timestamps: true,
  collection: 'admin_users'
});

module.exports = mongoose.model('AdminUser', AdminUserSchema);
