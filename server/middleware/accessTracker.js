import Resource from '../models/Resource.js';

const accessTracker = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = async function(data) {
    try {
      const resourceId = req.params.id;
      if (resourceId) {
        await Resource.findByIdAndUpdate(resourceId, {
          $inc: { accessCount: 1 },
          $set: { lastAccessed: new Date() },
          $push: {
            accessHistory: {
              ip: req.ip,
              userAgent: req.get('user-agent')
            }
          }
        });
      }
    } catch (error) {
      console.error('访问统计更新失败:', error);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

export default accessTracker; 