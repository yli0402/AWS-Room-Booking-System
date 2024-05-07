import { useState } from "react";

const useRowSelection = (data, identifier) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleRowSelection = (identifier) => {
    setSelectedRows((prev) => {
      if (prev.includes(identifier)) {
        return prev.filter((itemId) => itemId !== identifier);
      } else {
        return [...prev, identifier];
      }
    });
  };

  const toggleAllSelection = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((item) => item[identifier]));
    }
  };

  return {
    selectedRows,
    setSelectedRows,
    toggleRowSelection,
    toggleAllSelection,
  };
};

export default useRowSelection;
