import { useMemo } from "react";

const usePaginateData = (data, currentPage, rowsPerPage) => {
  return useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, rowsPerPage]);
};

export default usePaginateData;
