const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all users (protected, admin only in future)
router.get('/', auth, async (req, res) => {
  try {
    // Get admin_users (dashboard users)
    const adminUsersCollection = mongoose.connection.collection('admin_users');
    const adminUsers = await adminUsersCollection.find().toArray();
    
    // Format admin users
    const formattedAdminUsers = adminUsers.map(user => ({
      id: user._id.toString(),
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role || 'user',
      organization: user.organization || '',
      permissions: user.permissions || [],
      status: user.status || 'pending',
      createdFromDashboard: user.createdFromDashboard !== false,
      createdBy: user.createdBy || 'Unknown',
      createdDate: user.createdDate || user.createdAt,
      lastLogin: user.lastLogin || null
    }));

    // Get regular users (system users)
    const User = require('../models/User');
    const systemUsers = await User.find().select('-password');
    
    // Format system users
    const formattedSystemUsers = systemUsers.map(user => ({
      id: user._id.toString(),
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role || 'user',
      organization: user.organization || user.organisationId?.toString() || '',
      permissions: user.permissions || [],
      status: user.status || 'active',
      createdFromDashboard: false,
      createdBy: 'System',
      createdDate: user.createdAt,
      lastLogin: user.lastLogin || null
    }));

    // Combine both user types
    const allUsers = [...formattedAdminUsers, ...formattedSystemUsers];
    
    // Count users by role
    const roleCounts = {};
    const statusCounts = {};
    
    allUsers.forEach(user => {
      // Count by role
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      
      // Count by status
      statusCounts[user.status] = (statusCounts[user.status] || 0) + 1;
    });
    
    // Get active users (users who have logged in)
    const activeUsers = allUsers.filter(user => user.lastLogin).length;
    
    // Get pending users
    const pendingUsers = allUsers.filter(user => user.status === 'pending').length;
    
    // Get dashboard vs system users count
    const dashboardUsers = allUsers.filter(user => user.createdFromDashboard).length;
    const systemCreatedUsers = allUsers.length - dashboardUsers;

    res.status(200).json({
      success: true,
      data: {
        users: allUsers,
        count: allUsers.length,
        statistics: {
          totalUsers: allUsers.length,
          activeUsers,
          pendingUsers,
          dashboardUsers,
          systemCreatedUsers,
          roleDistribution: roleCounts,
          statusDistribution: statusCounts
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get user count by role
router.get('/count-by-role', auth, async (req, res) => {
  try {
    const adminUsersCollection = mongoose.connection.collection('admin_users');
    const adminUsers = await adminUsersCollection.find().toArray();
    
    const User = require('../models/User');
    const systemUsers = await User.find().select('-password');
    
    const allUsers = [...adminUsers, ...systemUsers];
    
    const roleCounts = {};
    allUsers.forEach(user => {
      const role = user.role || 'user';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    res.status(200).json({
      success: true,
      data: {
        roleCounts,
        totalUsers: allUsers.length
      }
    });
  } catch (error) {
    console.error('Get user count by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error counting users by role'
    });
  }
});

// Get user statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const adminUsersCollection = mongoose.connection.collection('admin_users');
    const adminUsers = await adminUsersCollection.find().toArray();
    
    const User = require('../models/User');
    const systemUsers = await User.find().select('-password');
    
    const allUsers = [...adminUsers, ...systemUsers];
    
    const statistics = {
      total: allUsers.length,
      dashboardUsers: adminUsers.length,
      systemUsers: systemUsers.length,
      activeUsers: allUsers.filter(user => user.status === 'active').length,
      inactiveUsers: allUsers.filter(user => user.status === 'inactive').length,
      pendingUsers: allUsers.filter(user => user.status === 'pending').length,
      hasLoggedIn: allUsers.filter(user => user.lastLogin).length,
      neverLoggedIn: allUsers.filter(user => !user.lastLogin).length
    };
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
});

// Get users by specific role
router.get('/role/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    
    const adminUsersCollection = mongoose.connection.collection('admin_users');
    const adminUsers = await adminUsersCollection.find({ role }).toArray();
    
    const User = require('../models/User');
    const systemUsers = await User.find({ role }).select('-password');
    
    const usersByRole = [...adminUsers, ...systemUsers];
    
    res.status(200).json({
      success: true,
      data: {
        role,
        users: usersByRole.map(user => ({
          id: user._id.toString(),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          role: user.role || 'user',
          status: user.status || 'active'
        })),
        count: usersByRole.length
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by role'
    });
  }
});

module.exports = router;