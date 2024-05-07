import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useSearchData from "../../../hooks/useSearchData";
import usePaginateData from "../../../hooks/usePaginateData";
import useRowSelection from "../../../hooks/useRowSelection";
import useSortData from "../../../hooks/useSortData";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaSort, FaXmark, FaCheck } from "react-icons/fa6";
import { PiSelectionAllFill } from "react-icons/pi";
import Pagination from "../../../components/Pagination";
import { useGetUsersQuery } from "../../../slices/usersApiSlice";
import Loader from "../../../components/Loader";
import Message from "../../../components/Message";
import { useUpdateUserMutation } from "../../../slices/usersApiSlice";
import { toast } from "react-toastify";
import JSXMsgModal from "../../../components/JSXMsgModal";

const UserManagementPage = () => {
  const { data: users, error, isLoading, refetch } = useGetUsersQuery();
  const [updateUser, { isLoading: isUpdating, error: updateError }] =
    useUpdateUserMutation();

  const usersData = useMemo(() => {
    if (isLoading || !users || !users.result) {
      return [];
    }

    return users.result;
  }, [isLoading, users]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { sortedData, sortBy } = useSortData(usersData);
  const searchedData = useSearchData(sortedData, search, selectedCategory, [
    "userId",
    "isActive",
  ]);
  const displayedData = usePaginateData(searchedData, currentPage, rowsPerPage);

  const {
    selectedRows,
    setSelectedRows,
    toggleRowSelection,
    toggleAllSelection,
  } = useRowSelection(usersData, "userId");

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

  const requestToggleIsActive = (user) => {
    setUserToToggleStatus(user);
    setIsModalOpen(true);
  };

  const handleConfirmToggleIsActive = async () => {
    if (userToToggleStatus) {
      const reqBody = {
        username: userToToggleStatus.username,
        firstName: userToToggleStatus.firstName,
        lastName: userToToggleStatus.lastName,
        email: userToToggleStatus.email,
        floor: userToToggleStatus.floor,
        desk: userToToggleStatus.desk,
        building: {
          buildingId: userToToggleStatus.building.buildingId,
        },
        role: userToToggleStatus.role,
        isActive: !userToToggleStatus.isActive,
      };

      try {
        await updateUser({
          id: userToToggleStatus.userId,
          user: reqBody,
        }).unwrap();
        refetch();
        toast.success("User status updated successfully");
      } catch (err) {
        toast.error(err?.data?.error || "Failed to update user status");
      }
      setIsModalOpen(false);
      setUserToToggleStatus(null);
    }
  };

  return (
    <div className="flex  flex-col justify-center gap-y-4 px-10 sm:px-0">
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
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="city.cityId">City</option>
              <option value="building.code">Building Number</option>
              <option value="floor">Floor</option>
              <option value="desk">Desk</option>
            </select>
          </div>
        </div>

        {/* Add New User + Select All (mobile) + Delete Selected   */}
        <div className="flex justify-start gap-x-4 ">
          <Link
            to="/userManagementAddPage"
            className="flex h-8 cursor-pointer items-center rounded-lg bg-theme-orange px-4 py-2 font-amazon-ember text-sm text-theme-dark-blue transition-colors duration-300 ease-in-out  hover:bg-theme-dark-orange hover:text-white   md:h-10 md:text-base"
          >
            New User
          </Link>
          {/* <a
            href="#"
            className={`flex h-8 w-8 items-center justify-center  rounded-lg border-2 border-theme-orange p-1.5 text-theme-orange transition-colors duration-300  ease-in-out md:hidden ${
              searchedData.length > 0 &&
              selectedRows.length === searchedData.length
                ? "bg-theme-orange text-white"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault(); // prevent the default anchor link behavior
              toggleAllSelection();
            }}
          >
            <PiSelectionAllFill />
          </a>

          <a
            href="#"
            className="flex h-8  w-8 items-center justify-center rounded-lg border-2 border-red-500 p-1.5 text-red-500 transition-colors duration-300 ease-in-out  md:h-10 md:w-16"
            onClick={() => {
              // pop up window to confirm delete
              // Delete the selected rows
              setSelectedRows([]);
            }}
          >
            <MdDelete />
          </a> */}
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message severity="error">{error.data?.message}</Message>
      ) : (
        <>
          {/* Data Table */}
          <div className="hidden  h-[calc(100vh-15rem)] overflow-x-auto rounded-lg shadow md:block">
            <table className="min-w-full divide-y">
              <thead className="sticky top-0 z-10 border-b-2 border-gray-200 bg-gray-50">
                <tr>
                  {/* <th className="p-3 text-left font-amazon-ember font-medium uppercase tracking-wider text-gray-500">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(
                            searchedData.map((row) => row.userId),
                          );
                        } else {
                          setSelectedRows([]);
                        }
                      }}
                      checked={
                        searchedData.length > 0 &&
                        selectedRows.length === searchedData.length
                      }
                      className="accent-theme-orange"
                    />
                  </th> */}
                  {[
                    { key: "username", display: "Username" },
                    { key: "email", display: "Email" },
                    { key: "firstName", display: "First Name" },
                    { key: "lastName", display: "Last Name" },
                    { key: "city.cityId", display: "City" },
                    { key: "building.code", display: "Building Number" },
                    { key: "floor", display: "Floor" },
                    { key: "desk", display: "Desk" },
                    { key: "role", display: "Role" },
                  ].map((header) => (
                    <th
                      key={header.key} // Use the key for React's key prop
                      onClick={() => sortBy(header.key)} // Use the key for sorting
                      className="cursor-pointer p-3 text-left font-amazon-ember text-base font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        {header.display} <FaSort />
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-left font-amazon-ember text-base font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700">
                    Is Active
                  </th>

                  <th className="p-3 text-left font-amazon-ember text-base font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700">
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="11"
                      className="text-md whitespace-nowrap p-3 text-center font-amazon-ember font-medium text-gray-900"
                    >
                      No result
                    </td>
                  </tr>
                ) : (
                  displayedData.map((row) => (
                    <tr
                      key={row.userId}
                      className={`font-amazon-ember hover:bg-theme-orange hover:bg-opacity-10 ${selectedRows.includes(row.userId) ? "bg-theme-orange bg-opacity-10" : ""}`}
                      // onClick={() => toggleRowSelection(row.userId)}
                    >
                      {/* <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.userId)}
                          className="accent-theme-orange"
                        />
                      </td> */}
                      <td className="whitespace-nowrap p-3">{row.username}</td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.email}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.firstName}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.lastName}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.city.cityId}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.building.code}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {String(row.floor).padStart(2, "0")}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-500">
                        {row.desk}
                      </td>
                      <td className="whitespace-nowrap p-3">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold uppercase leading-5 ${row.role === "admin" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {row.role}
                        </span>
                      </td>

                      <td className="cursor-pointer whitespace-nowrap p-3 text-sm font-medium">
                        <div
                          onClick={() => requestToggleIsActive(row)}
                          className={`relative inline-flex h-6 w-12 cursor-pointer items-center justify-center rounded-full ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
                        >
                          <div
                            className={`dot absolute left-[2px] top-[2px] flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform duration-300 ease-in-out ${row.isActive ? "translate-x-[24px]" : ""}`}
                          >
                            {row.isActive ? (
                              <FaCheck className="size-3 text-green-500" />
                            ) : (
                              <FaXmark className="size-3  text-red-500" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-3  text-sm font-medium">
                        <div className="flex justify-start">
                          <Link
                            to={`/userManagementEditPage/${row.userId}`}
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
          <div className="grid h-[calc(100vh-15rem)]  grid-cols-1 gap-4 overflow-x-auto rounded-lg border-y-2 font-amazon-ember sm:grid-cols-2 md:hidden ">
            {displayedData.length === 0 ? (
              <div className="col-span-1 flex h-full items-center justify-center sm:col-span-2">
                <div className="text-md whitespace-nowrap p-3 font-amazon-ember font-medium text-gray-900">
                  No result
                </div>
              </div>
            ) : (
              displayedData.map((row) => (
                <div
                  key={row.userId}
                  className={`space-y-3 rounded-lg p-4 shadow  ${selectedRows.includes(row.userId) ? "bg-theme-orange bg-opacity-10" : ""}`}
                  // onClick={() => toggleRowSelection(row.userId)}
                >
                  {/* name */}
                  <div className="flex items-center justify-between">
                    <div className="break-words font-amazon-ember text-sm font-medium text-gray-900">
                      {row.firstName} {row.lastName}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase  ${row.role === "admin" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {row.role}
                    </span>
                  </div>
                  {/* username */}
                  <div className="break-words text-sm text-gray-900">
                    <span className="font-bold text-theme-dark-orange">
                      Username:{" "}
                    </span>
                    {`${row.username}`}
                  </div>
                  {/* email */}
                  <div className="break-words text-sm text-gray-900">
                    <span className="font-bold text-theme-dark-orange">
                      Email:{" "}
                    </span>
                    {`${row.email}`}
                  </div>
                  <div className="break-words text-sm text-gray-900">
                    <span className="font-bold text-theme-dark-orange">
                      Location:{" "}
                    </span>
                    {`${row.city.cityId} ${row.building.code}, Floor ${String(row.floor).padStart(2, "0")}, Desk ${row.desk}`}
                  </div>
                  {/* status + action */}
                  <div className="flex items-center  justify-between space-x-2 text-sm">
                    <div className="inline-flex items-center">
                      <span className="mr-2 font-bold text-theme-dark-orange">
                        Is Active:{" "}
                      </span>
                      <div
                        onClick={() => requestToggleIsActive(row)}
                        className={`relative inline-flex h-4 w-8 cursor-pointer items-center justify-center rounded-full ${row.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <div
                          className={`dot absolute left-[1px] top-[1px] flex h-[14px] w-[14px] items-center justify-center rounded-full bg-white transition-transform duration-300 ease-in-out ${row.isActive ? "translate-x-[16px]" : ""}`}
                        >
                          {row.isActive ? (
                            <FaCheck className="size-2 text-green-500" />
                          ) : (
                            <FaXmark className="size-2  text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-6">
                      <Link
                        to={`/userManagementEditPage/${row.userId}`}
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
          {isModalOpen && (
            <JSXMsgModal
              message={
                <>
                  <div>
                    Are you sure you want to change the status of this user?{" "}
                  </div>
                  <div className="mt-4 text-yellow-400">
                    Warning: If you are disabling this user, they will no longer
                    be able to login again or be invited to meetings.
                  </div>
                </>
              }
              onConfirm={handleConfirmToggleIsActive}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
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

export default UserManagementPage;
