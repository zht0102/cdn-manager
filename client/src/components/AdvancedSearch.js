import React, { useState } from 'react';
import { 
  Card, Form, Input, Select, DatePicker, Button, 
  Row, Col, Tag, Space 
} from 'antd';
import { SearchOutlined, UndoOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdvancedSearch = ({ onSearch, categories }) => {
  const [form] = Form.useForm();
  const [expandForm, setExpandForm] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const handleSearch = (values) => {
    const filters = [];
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (key === 'dateRange') {
            filters.push(`上传时间: ${value.map(d => d.format('YYYY-MM-DD')).join(' 至 ')}`);
          } else {
            filters.push(`${key}: ${value.join(', ')}`);
          }
        } else {
          filters.push(`${key}: ${value}`);
        }
      }
    });
    setActiveFilters(filters);
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    setActiveFilters([]);
    onSearch({});
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form
        form={form}
        onFinish={handleSearch}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="keyword" label="关键词">
              <Input placeholder="搜索文件名或描述" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="categories" label="分类">
              <Select
                mode="multiple"
                placeholder="选择分类"
                allowClear
              >
                {categories.map(cat => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="dateRange" label="上传时间">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {expandForm && (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fileType" label="文件类型">
                <Select mode="multiple" placeholder="选择文件类型">
                  <Option value="image">图片</Option>
                  <Option value="video">视频</Option>
                  <Option value="audio">音频</Option>
                  <Option value="document">文档</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="size" label="文件大小">
                <Select>
                  <Option value="0-1">1MB以下</Option>
                  <Option value="1-10">1-10MB</Option>
                  <Option value="10-100">10-100MB</Option>
                  <Option value="100+">100MB以上</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sort" label="排序方式">
                <Select>
                  <Option value="uploadDate,desc">上传时间降序</Option>
                  <Option value="uploadDate,asc">上传时间升序</Option>
                  <Option value="size,desc">文件大小降序</Option>
                  <Option value="size,asc">文件大小升序</Option>
                  <Option value="accessCount,desc">访问次数降序</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="link" 
                onClick={() => setExpandForm(!expandForm)}
              >
                {expandForm ? '收起' : '展开'} 
              </Button>
              <Button 
                icon={<UndoOutlined />} 
                onClick={handleReset}
              >
                重置
              </Button>
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                htmlType="submit"
              >
                搜索
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {activeFilters.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <span style={{ marginRight: 8 }}>已选筛选条件:</span>
          {activeFilters.map((filter, index) => (
            <Tag 
              key={index}
              closable
              onClose={() => {
                const newFilters = activeFilters.filter((_, i) => i !== index);
                setActiveFilters(newFilters);
                // 这里需要根据实际情况更新表单值
              }}
            >
              {filter}
            </Tag>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AdvancedSearch; 