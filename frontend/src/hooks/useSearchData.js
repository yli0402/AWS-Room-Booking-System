import { useMemo } from "react";

const useSearchData = (
  data,
  searchQuery,
  selectedCategory,
  excludeFields = [],
) => {
  // Get nested value from object (eg. city.cityId)
  const getNestedValue = (object, path) => {
    return path
      .split(".")
      .reduce(
        (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
        object,
      );
  };

  const searchNested = (value, query) => {
    if (typeof value === "object" && value !== null) {
      // nested value is an object
      return Object.entries(value).some(([key, nestedValue]) =>
        searchNested(nestedValue, query),
      );
    } else if (Array.isArray(value)) {
      // nested value is an array
      return value.some((element) => searchNested(element, query));
    } else {
      // nested value is a primitive
      return String(value).toLowerCase().includes(query.toLowerCase());
    }
  };

  return useMemo(() => {
    if (!searchQuery) return data;

    return data.filter((row) => {
      if (selectedCategory === "all") {
        // When searching in all categories, search within each value, except for excluded fields
        return Object.entries(row).some(([key, value]) =>
          excludeFields.includes(key)
            ? false
            : searchNested(value, searchQuery),
        );
      } else {
        // When searching in a specific category, search within the selected category without considering excluded fields
        const value = getNestedValue(row, selectedCategory);
        return searchNested(value, searchQuery);
      }
    });
  }, [data, searchQuery, selectedCategory, excludeFields]);
};

export default useSearchData;
