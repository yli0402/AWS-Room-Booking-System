import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useSearchData from "../../../hooks/useSearchData";
import usePaginateData from "../../../hooks/usePaginateData";
import useSortData from "../../../hooks/useSortData";
import useRowSelection from "../../../hooks/useRowSelection";
import { FaEdit, FaSort } from "react-icons/fa";
import Pagination from "../../../components/Pagination";
import { useGetBuildingsQuery } from "../../../slices/buildingsApiSlice";
import Loader from "../../../components/Loader";
import Message from "../../../components/Message";
import { toast } from "react-toastify";

const BuildingManagementPage = () => {
  const { data: buildings, error, isLoading, refetch } = useGetBuildingsQuery();

  const buildingsData = useMemo(() => {
    if (isLoading || !buildings || !buildings.result) {
      return [];
    }
    return buildings.result;
  }, [isLoading, buildings]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { sortedData, sortBy } = useSortData(buildingsData);
  const searchedData = useSearchData(sortedData, search, selectedCategory, [
    "buildingId",
    "isActive",
  ]);
  const displayedData = usePaginateData(searchedData, currentPage, rowsPerPage);

  const {
    selectedRows,
    setSelectedRows,
    toggleRowSelection,
    toggleAllSelection,
  } = useRowSelection(buildingsData, "buildingId");

  const handleChangePage = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1); // reset to first page on search
  };

  return (
    <div className="flex flex-col justify-center gap-y-4 px-10 sm:px-0">
      <div className="flex flex-col gap-y-2 sm:flex-row sm:justify-between">
        {/* Search Bar */}
        <div className="flex flex-grow gap-x-2 font-amazon-ember">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
            className="h-8  rounded-lg border-2 border-gray-200 p-2 text-xs md:h-10 md:w-1/3 md:text-base"
          />
          <div>
            <select
              className="h-8 rounded-lg border-2 border-gray-200  text-xs md:h-10  md:text-base"
              name="searchBy"
              id="searchBy"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All</option>
              <option value="city.cityId">City</option>
              <option value="code">Building Number</option>
              <option value="address">Address</option>
              <option value="lon">Longitude</option>
              <option value="lat">Latitude</option>
            </select>
          </div>
        </div>

        {/* Add New Building + Select All (mobile)  + Delete Selected */}
        <div className="flex justify-start gap-x-4 ">
          <Link
            to="/buildingManagementAddPage"
            className="flex h-8 cursor-pointer items-center rounded-lg bg-theme-orange px-4 py-2 font-amazon-ember text-sm text-theme-dark-blue transition-colors duration-300 ease-in-out  hover:bg-theme-dark-orange hover:text-white   md:h-10 md:text-base"
          >
            New Building
          </Link>
          <Link
            to="/roomManagementPage"
            className="flex h-8 cursor-pointer items-center rounded-lg bg-theme-dark-blue px-4 py-2 font-amazon-ember text-sm text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white md:h-10 md:text-base"
          >
            Back
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message severity="error">{error.data?.error}</Message>
      ) : (
        <>
          {/* Data Table */}
          <div className="hidden  h-[calc(100vh-15rem)] overflow-x-auto rounded-lg shadow md:block">
            <table className="min-w-full divide-y">
              <thead className="sticky top-0 z-10 border-b-2 border-gray-200 bg-gray-50">
                <tr>
                  {[
                    { key: "city.cityId", display: "City" },
                    { key: "code", display: "Building Number" },
                    { key: "address", display: "Address" },
                    { key: "lon", display: "Longitude" },
                    { key: "lat", display: "Latitude" },
                  ].map((header) => (
                    <th
                      key={header.key}
                      onClick={() => sortBy(header.key)} // Use the key for sorting
                      className="cursor-pointer p-3 text-left font-amazon-ember text-base font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        {header.display} <FaSort />
                      </div>
                    </th>
                  ))}

                  <th className="p-3 text-left font-amazon-ember text-base font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700">
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-md whitespace-nowrap p-3 text-center font-amazon-ember font-medium text-gray-900"
                    >
                      No result
                    </td>
                  </tr>
                ) : (
                  displayedData.map((row) => (
                    <tr
                      key={row.buildingId}
                      className="font-amazon-ember hover:bg-theme-orange hover:bg-opacity-10"
                    >
                      <td className="whitespace-nowrap p-3">
                        {row.city.cityId}
                      </td>
                      <td className="whitespace-nowrap p-3">{row.code}</td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.address}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.lon}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.lat}
                      </td>

                      <td className="whitespace-nowrap p-3  text-sm font-medium">
                        <div className="flex justify-start">
                          <Link
                            to={`/buildingManagementEditPage/${row.buildingId}`}
                            className="mr-6 text-indigo-600 hover:text-indigo-900"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaEdit className="size-6" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* mobile */}
          <div className="grid h-[calc(100vh-15rem)] grid-cols-1 gap-4 overflow-x-auto rounded-lg border-y-2 sm:grid-cols-2 md:hidden ">
            {displayedData.length === 0 ? (
              <div className="col-span-1 flex h-full items-center justify-center sm:col-span-2">
                <div className="text-md whitespace-nowrap p-3 font-amazon-ember font-medium text-gray-900">
                  No result
                </div>
              </div>
            ) : (
              displayedData.map((row) => (
                <div
                  key={row.buildingId}
                  className={`space-y-3 rounded-lg p-4 shadow-md`}
                >
                  <div className="font-amazon-ember text-base text-gray-900">
                    {`${row.city.cityId} ${row.code}`}
                  </div>

                  <div className="font-amazon-ember text-sm text-gray-500">
                    <span className="mr-2 font-bold text-theme-dark-orange">
                      Address:
                    </span>
                    {row.address}
                  </div>
                  <div className="font-amazon-ember text-sm text-gray-500">
                    <span className="mr-2 font-bold text-theme-dark-orange">
                      Location:
                    </span>
                    {`${row.lon}, ${row.lat}`}
                  </div>
                  {/* status + action */}
                  <div className="flex items-center justify-end space-x-2">
                    <div className="flex space-x-6">
                      <Link
                        to={`/buildingManagementEditPage/${row.buildingId}`}
                        className="text-indigo-600 hover:text-indigo-900 "
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaEdit className="size-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Pagination */}
      <div>
        {displayedData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            count={searchedData.length}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}
      </div>
    </div>
  );
};

export default BuildingManagementPage;
