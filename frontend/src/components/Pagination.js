import React, { useState } from "react";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";

const Pagination = ({
  currentPage,
  rowsPerPage,
  count,
  handleChangePage,
  handleChangeRowsPerPage,
}) => {
  const [goToPage, setGoToPage] = useState("");

  const handleGoToPage = (event) => {
    setGoToPage(event.target.value);
    const pageNumber = parseInt(event.target.value, 10);
    if (
      !isNaN(pageNumber) &&
      pageNumber >= 1 &&
      pageNumber <= Math.ceil(count / rowsPerPage)
    ) {
      handleChangePage(pageNumber);
    }
    if (isNaN(pageNumber)) {
      setGoToPage("");
    }
  };

  const totalPages = Math.ceil(count / rowsPerPage);
  const from = (currentPage - 1) * rowsPerPage + 1;
  const to = Math.min(currentPage * rowsPerPage, count);

  return (
    <div className="flex items-center justify-between gap-x-6 font-amazon-ember md:justify-normal ">
      {/* page number */}
      <div className="flex flex-col">
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleChangePage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`text-gray-500 transition-colors  duration-300 ease-in-out ${currentPage === 1 ? "cursor-not-allowed" : "hover:text-theme-orange"}`}
          >
            <IoIosArrowDropleftCircle className="size-6  md:size-8" />
          </button>
          <span className="mx-2 hidden text-sm md:inline-flex md:text-base">
            {from}-{to} of {count}
          </span>
          <button
            onClick={() => handleChangePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`text-gray-500 transition-colors  duration-300 ease-in-out ${currentPage === totalPages ? "cursor-not-allowed" : "hover:text-theme-orange"}`}
          >
            <IoIosArrowDroprightCircle className="size-6 md:size-8" />
          </button>
        </div>

        <span className="mx-2 text-sm md:hidden">
          {from}-{to} of {count}
        </span>
      </div>

      {/* rows per page */}
      <div>
        <label className="mr-2 text-sm md:text-base">Rows per page</label>
        <select
          value={rowsPerPage}
          onChange={(event) => handleChangeRowsPerPage(event)}
          className="rounded-md border border-gray-300 px-2 py-1  text-sm md:text-base"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* go to page  */}
      <div>
        <label className="mr-2 text-sm  md:text-base">Go to page</label>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={goToPage}
          onChange={handleGoToPage}
          className="w-20  rounded-md border border-gray-300 px-2 py-1 text-sm md:text-base"
        />
      </div>
    </div>
  );
};

export default Pagination;
