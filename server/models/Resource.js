import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String
  }],
  description: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date
  },
  accessHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deleteDate: {
    type: Date
  },
  restoreDeadline: {
    type: Date
  }
});

// 软删除中间件
resourceSchema.pre('find', function() {
  if (!this._conditions.includeDeleted) {
    this._conditions.isDeleted = false;
  }
});

resourceSchema.pre('findOne', function() {
  if (!this._conditions.includeDeleted) {
    this._conditions.isDeleted = false;
  }
});

export default mongoose.model('Resource', resourceSchema); 