import { Button, Input, Space, Tag } from 'antd';
import {  PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface AmenitiesInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const AmenitiesInput = ({
  value = [],
  onChange,
  disabled = false,
  placeholder = "Enter amenity name"
}: AmenitiesInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    if (inputValue.trim()) {
      const newAmenities = [...value, inputValue.trim()];
      onChange(newAmenities);
      setInputValue('');
    }
  };

  const handleRemove = (index: number) => {
    const newAmenities = value.filter((_, i) => i !== index);
    onChange(newAmenities);
  };


  return (
    <div className="flex flex-col gap-3">
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={disabled}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={disabled}
        >
          Add
        </Button>
      </Space.Compact>

      <div className="flex flex-wrap gap-2">
        {value.map((amenity, index) => (
          <Tag
            key={index}
            closable={!disabled}
            onClose={() => handleRemove(index)}
            color="blue"
          >
            {amenity}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesInput;
