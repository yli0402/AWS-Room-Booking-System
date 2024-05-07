import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useSearchData from "../../../hooks/useSearchData";
import usePaginateData from "../../../hooks/usePaginateData";
import useSortData from "../../../hooks/useSortData";
import useRowSelection from "../../../hooks/useRowSelection";
import { FaEdit } from "react-icons/fa";
import { FaCheck, FaSort, FaXmark } from "react-icons/fa6";
import Pagination from "../../../components/Pagination";
import {
  useGetRoomsQuery,
  useUpdateRoomMutation,
} from "../../../slices/roomsApiSlice";
import Loader from "../../../components/Loader";
import Message from "../../../components/Message";
import { toast } from "react-toastify";
import JSXMsgModal from "../../../components/JSXMsgModal";

const RoomManagementPage = () => {
  const { data: rooms, error, isLoading, refetch } = useGetRoomsQuery();
  const [updateRoom, { isLoading: isUpdating, error: updateError }] =
    useUpdateRoomMutation();

  const roomsData = useMemo(() => {
    if (isLoading || !rooms || !rooms.result) {
      return [];
    }
    return rooms.result;
  }, [isLoading, rooms]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roomToToggleStatus, setRoomToToggleStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { sortedData, sortBy } = useSortData(roomsData);
  const searchedData = useSearchData(sortedData, search, selectedCategory, [
    "roomId",
    "isActive",
  ]);
  const displayedData = usePaginateData(searchedData, currentPage, rowsPerPage);

  const {
    selectedRows,
    setSelectedRows,
    toggleRowSelection,
    toggleAllSelection,
  } = useRowSelection(roomsData, "roomId");

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

  const requestToggleIsActive = (room) => {
    setRoomToToggleStatus(room);
    setIsModalOpen(true);
  };

  const handleConfirmToggleIsActive = async () => {
    if (roomToToggleStatus) {
      const reqBody = {
        floorNumber: roomToToggleStatus.floorNumber,
        roomCode: roomToToggleStatus.roomCode,
        roomName: roomToToggleStatus.roomName,
        numberOfSeats: roomToToggleStatus.numberOfSeats,
        building: {
          buildingId: roomToToggleStatus.building.buildingId,
        },
        equipmentList: roomToToggleStatus.equipmentList.map((equipment) => ({
          equipmentId: equipment.equipmentId,
        })),
        isActive: !roomToToggleStatus.isActive,
      };
      try {
        await updateRoom({
          id: roomToToggleStatus.roomId,
          room: reqBody,
        }).unwrap();
        refetch();
        toast.success("Room status updated successfully!");
      } catch (err) {
        toast.error(err?.data?.error || "Failed to update room status");
      }

      setIsModalOpen(false);
      setRoomToToggleStatus(null);
    }
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
              <option value="building.code">Building Number</option>
              <option value="floorNumber">Floor</option>
              <option value="roomCode">Room Code</option>
              <option value="roomName">Room Name</option>
              <option value="numberOfSeats">Capacity</option>
              <option value="equipmentList">Equipments</option>
            </select>
          </div>
        </div>

        {/* Add New Room + Select All (mobile)  + Delete Selected */}
        <div className="flex justify-start gap-x-4 font-amazon-ember ">
          <Link
            to="/roomManagementAddPage"
            className="cursor-pointer rounded-lg bg-theme-orange px-2 py-1 text-sm text-theme-dark-blue transition-colors duration-300 ease-in-out  hover:bg-theme-dark-orange hover:text-white   md:px-4 md:py-2 md:text-base"
          >
            New Room
          </Link>
          <Link
            to="/buildingManagementPage"
            className="cursor-pointer rounded-lg bg-theme-dark-blue px-2 py-1 text-sm text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white md:px-4 md:py-2 md:text-base"
          >
            Manage Buildings
          </Link>
          {/* <a
            href="#"
            className={`flex h-8 w-8 items-center justify-center  rounded-lg border-2 border-theme-orange p-1.5 text-theme-orange transition-colors duration-300  ease-in-out  md:hidden ${
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
            className="flex h-8  w-8 items-center justify-center rounded-lg border-2 border-red-500 p-1.5 text-red-500 transition-colors duration-300 ease-in-out md:h-10 md:w-16"
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
                            searchedData.map((row) => row.roomId),
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
                    { key: "city.cityId", display: "City" },
                    { key: "building.code", display: "Building Number" },
                    { key: "floorNumber", display: "Floor" },
                    { key: "roomCode", display: "Room Code" },
                    { key: "roomName", display: "Room Name" },
                    { key: "numberOfSeats", display: "Capacity" },
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
                  {[
                    { key: "equipments", display: "Equipments" },
                    { key: "isActive", display: "Is Active" },
                  ].map((header) => (
                    <th
                      key={header.key}
                      className="p-3 text-left font-amazon-ember text-base font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      {header.display}
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
                      colSpan="9"
                      className="text-md whitespace-nowrap p-3 text-center font-amazon-ember font-medium text-gray-900"
                    >
                      No result
                    </td>
                  </tr>
                ) : (
                  displayedData.map((row) => (
                    <tr
                      key={row.roomId}
                      className={`font-amazon-ember hover:bg-theme-orange hover:bg-opacity-10 ${selectedRows.includes(row.roomId) ? "bg-theme-orange bg-opacity-10" : ""}`}
                      // onClick={() => toggleRowSelection(row.roomId)}
                    >
                      {/* <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.roomId)}
                          className="accent-theme-orange"
                        />
                      </td> */}
                      <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        {row.city.cityId}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        {row.building.code}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        {String(row.floorNumber).padStart(2, "0")}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        {row.roomCode}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        {row.roomName}
                      </td>
                      <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        {row.numberOfSeats}
                      </td>

                      <td className="whitespace-nowrap p-3 text-sm text-gray-900">
                        <ul>
                          {row.equipmentList.length > 0 ? (
                            row.equipmentList.map((equipment, index) => (
                              <li key={index}>{`${equipment.equipmentId}`}</li>
                            ))
                          ) : (
                            <li>None</li>
                          )}
                        </ul>
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
                            to={`/roomManagementEditPage/${row.roomId}`}
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
                  key={row.roomId}
                  className={`space-y-3 rounded-lg p-4 shadow-md`}
                  // onClick={() => toggleRowSelection(row.roomId)}
                >
                  <div className="font-amazon-ember text-base text-gray-900">
                    {`${row.city.cityId}${row.building.code} ${String(row.floorNumber).padStart(2, "0")}.${row.roomCode} ${row.roomName}`}
                  </div>

                  <div className="break-words font-amazon-ember text-sm text-gray-500">
                    <span className="block font-bold text-theme-dark-orange">
                      Equipments:
                    </span>
                    <ul>
                      {row.equipmentList.length > 0 ? (
                        row.equipmentList.map((equipment, index) => (
                          <li key={index}>{`${equipment.equipmentId}`}</li>
                        ))
                      ) : (
                        <li>None</li>
                      )}
                    </ul>
                  </div>
                  <div className="font-amazon-ember text-sm text-gray-500">
                    <span className="mr-2 font-bold text-theme-dark-orange">
                      Capacity:
                    </span>
                    {row.numberOfSeats}
                  </div>
                  {/* status + action */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="inline-flex items-center">
                      <span className="mr-2 text-sm text-theme-dark-orange">
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
                        to={`/roomManagementEditPage/${row.roomId}`}
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
                    Are you sure you want to change the status of this room?{" "}
                  </div>
                  <div className="mt-4 text-yellow-400">
                    Warning: If you are disabling this room,
                    it can no longer be booked and all existing future bookings
                    for this room will be automatically canceled.
                    Once a booking is canceled, it cannot be reversed.
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

export default RoomManagementPage;
