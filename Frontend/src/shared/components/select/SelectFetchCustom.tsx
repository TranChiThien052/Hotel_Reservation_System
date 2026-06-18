import React, { useEffect, useState } from 'react';
import type { SelectProps } from 'antd';
import SelectCustom from './SelectCustom';

export interface SelectFetchCustomProps extends SelectProps {
  fetchOptions?: () => Promise<any>;
  customData?: any; // Dữ liệu tùy chỉnh nếu cần thiết
}

const SelectFetchCustom: React.FC<SelectFetchCustomProps> = ({ fetchOptions, customData, ...props }) => {
  const [options, setOptions] = useState<SelectProps['options']>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!fetchOptions) return;
    setLoading(true);

    try {
      const data = await fetchOptions();
      console.log("Fetched options successfully", data);
      let dataOptions = data;
      
      if(!!customData) {
        dataOptions = customData(data);
      } 

      console.log("Processed options", dataOptions);

      setOptions(dataOptions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <SelectCustom loading={loading} options={options} {...props} />;
};

export default SelectFetchCustom;