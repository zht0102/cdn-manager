import React, { useState, useEffect } from 'react';
import { Table, Space, Button, message, Tooltip } from 'antd';
import { UndoOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface TrashItem {
  _id: string;
  originalName: string;
  size: number;
  mimeType: string;
  deleteDate: string;
  restoreDeadline: string;
}

const TrashList: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>([]);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get('/api/trash');
      setItems(data.data);
    } catch (error) {
      message.error('获取垃圾桶列表失败');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRestore = async (id: string) => {
    try {
      await axios.put(`/api/trash/${id}/restore`);
      message.success('文件已恢复');
      fetchItems();  // 修改这里：从 fetchTrash 改为 fetchItems
    } catch (error) {
      message.error('恢复失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/trash/${id}`);
      message.success('文件已永久删除');
      fetchItems();  // 修改这里：从 fetchTrash 改为 fetchItems
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<TrashItem> = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      key: 'originalName',
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'mimeType',
      key: 'mimeType',
      width: 120
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`
    },
    {
      title: '删除时间',
      dataIndex: 'deleteDate',
      key: 'deleteDate',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '恢复截止时间',
      dataIndex: 'restoreDeadline',
      key: 'restoreDeadline',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="恢复">
            <Button
              type="link"
              icon={<UndoOutlined />}
              onClick={() => handleRestore(record._id)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={items}
      rowKey="_id"
    />
  );
};

export default TrashList;