import { useState, useMemo } from "react";

const useSortData = (data) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "" });

  // Get nested value from object (eg. city.cityId)
  const getNestedValue = (object, path) => {
    return path
      .split(".")
      .reduce(
        (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
        object,
      );
  };

  const sortBy = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    } else {
      direction = "ascending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data; // No sorting if sortConfig.key is null
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  return { sortedData, sortBy };
};

export default useSortData;
