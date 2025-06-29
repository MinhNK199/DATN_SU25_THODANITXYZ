import React from 'react';
import { Button, Input, Space, Form, Row, Col, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface SpecificationEditorProps {
  value: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
}

const SpecificationEditor: React.FC<SpecificationEditorProps> = ({ value = {}, onChange }) => {
  const [specs, setSpecs] = React.useState<{ key: string; value: string }[]>(
    Object.entries(value || {}).map(([key, val]) => ({ key, value: val }))
  );

  React.useEffect(() => {
    onChange(Object.fromEntries(specs.filter(s => s.key)));
    // eslint-disable-next-line
  }, [specs]);

  const handleAdd = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemove = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleChange = (idx: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specs];
    newSpecs[idx][field] = val;
    setSpecs(newSpecs);
  };

  const validateKey = (key: string, idx: number) => {
    if (!key.trim()) {
      message.error('Tên thông số không được để trống!');
      return false;
    }
    if (specs.some((s, i) => s.key === key && i !== idx)) {
      message.error('Tên thông số bị trùng!');
      return false;
    }
    return true;
  };

  return (
    <div>
      {specs.map((spec, idx) => (
        <Row gutter={8} key={idx} align="middle" className="mb-2">
          <Col span={10}>
            <Input
              placeholder="Tên thông số"
              value={spec.key}
              onChange={e => handleChange(idx, 'key', e.target.value)}
              onBlur={e => validateKey(e.target.value, idx)}
            />
          </Col>
          <Col span={12}>
            <Input
              placeholder="Giá trị"
              value={spec.value}
              onChange={e => handleChange(idx, 'value', e.target.value)}
            />
          </Col>
          <Col span={2}>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleRemove(idx)}
              disabled={specs.length === 1}
            />
          </Col>
        </Row>
      ))}
      <Button icon={<PlusOutlined />} onClick={handleAdd} type="dashed" block>
        Thêm thông số
      </Button>
    </div>
  );
};

export default SpecificationEditor; 