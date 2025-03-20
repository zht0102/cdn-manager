import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Space, message, Modal 
} from 'antd';
import { 
  DeleteOutlined, 
  UndoOutlined, 
  ClearOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const TrashBin = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // ... 实现类似 ResourceList 的功能，但针对回收站 ...

  return (
    <Card 
      title="回收站"
      extra={
        <Button 
          icon={<ClearOutlined />}
          danger
          onClick={() => handleCleanup()}
        >
          清空过期资源
        </Button>
      }
    >
      <Table
        columns={[
          // ... 类似的列定义 ...
          {
            title: '删除时间',
            dataIndex: 'deleteDate',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss')
          },
          {
            title: '过期时间',
            dataIndex: 'restoreDeadline',
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss')
          },
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <Space>
                <Button
                  type="link"
                  icon={<UndoOutlined />}
                  onClick={() => handleRestore(record._id)}
                >
                  恢复
                </Button>
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record._id)}
                >
                  彻底删除
                </Button>
              </Space>
            )
          }
        ]}
        dataSource={resources}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
      />
    </Card>
  );
};

export default TrashBin; 