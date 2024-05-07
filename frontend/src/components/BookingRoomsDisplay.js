import React, { useEffect, useMemo, useState } from "react";
import StartSearchGIF from "../assets/start-search.gif";
import Pagination from "../components/Pagination";
import MeetingRoomImg from "../assets/meeting-room.jpg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setSelectedRoomForGroup, stopSearch } from "../slices/bookingSlice";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import JSXMsgModal from "./JSXMsgModal";
import DropdownArrowSVG from "../assets/dropdown-arrow.svg";
import MoreInfo from "./MoreInfo";

const BookingRoomsDisplay = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showRecommended } = useSelector((state) => state.booking);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomForModal, setSelectedRoomForModal] = useState(null);
  const [messageForModal, setMessageForModal] = useState(null);
  const [selectedSearchOption, setSelectedSearchOption] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const searchPlaceholders = {
    all: "Search in all fields...",
    cityId: "Enter city...",
    buildingCode: "Enter building number...",
    roomCode: "Enter room code...",
    roomName: "Enter room name...",
    floorNumber: "Enter floor...",
    numberOfSeats: "Enter capacity...",
  };

  const searchPlaceholder =
    searchPlaceholders[selectedSearchOption] || "Search...";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination event handlers
  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const { groupedAttendees, groupToDisplay, searching, equipments } =
    useSelector((state) => state.booking);

  const handleSearchOptionChange = (event) => {
    setSelectedSearchOption(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const [sortOption, setSortOption] = useState("");

  const sortOptions = {
    floorAsc: (a, b) => a.floor - b.floor,
    floorDesc: (a, b) => b.floor - a.floor,
    roomNumberAsc: (a, b) => a.roomCode.localeCompare(b.roomCode),
    roomNumberDesc: (a, b) => b.roomCode.localeCompare(a.roomCode),
    capacityAsc: (a, b) => a.seats - b.seats,
    capacityDesc: (a, b) => b.seats - a.seats,
  };

  const availableRooms = useMemo(() => {
    // find the group by groupToDisplay
    const group = groupedAttendees.find((g) => g.groupId === groupToDisplay);
    let rooms = group ? (group.rooms ? group.rooms : []) : [];

    // If showRecommended is true, filter the rooms to only include those marked as recommended
    if (showRecommended) {
      rooms = rooms.filter((room) => room.recommended === true);
    }

    const selectedRoomsInOtherGroups = new Set(
      groupedAttendees
        .filter(
          (group) => group.groupId !== groupToDisplay && group.selectedRoom,
        )
        .map((group) => group.selectedRoom?.roomId),
    );
    rooms = rooms.filter(
      (room) => !selectedRoomsInOtherGroups.has(room.roomId),
    );

    if (
      searching &&
      rooms.length === 0 &&
      groupToDisplay !== "Ungrouped" &&
      groupToDisplay !== false
    ) {
      const message = showRecommended
        ? "No recommended rooms found"
        : "No available rooms found";
      toast.info(message);
      dispatch(stopSearch());
    }

    if (sortOption && sortOptions[sortOption]) {
      rooms.sort(sortOptions[sortOption]);
    }

    return rooms.filter((room) => {
      const searchValue = searchQuery.toLowerCase();
      switch (selectedSearchOption) {
        case "all":
          return (
            room.cityId.toLowerCase().includes(searchValue) ||
            room.buildingCode.toString().includes(searchValue) ||
            room.floor.toString().includes(searchQuery) ||
            room.roomCode.toString().includes(searchValue) ||
            room.roomName.toLowerCase().includes(searchValue) ||
            room.seats.toString().includes(searchQuery)
          );
        case "cityId":
          return room.cityId.toLowerCase().includes(searchValue);
        case "buildingCode":
          return room.buildingCode.toString().includes(searchValue);
        case "floorNumber":
          return room.floor.toString().includes(searchQuery);
        case "roomCode":
          return room.roomCode.toString().includes(searchValue);
        case "roomName":
          return room.roomName.toLowerCase().includes(searchValue);
        case "numberOfSeats":
          return room.seats.toString().includes(searchQuery);
        default:
          return true;
      }
    });
  }, [
    groupedAttendees,
    groupToDisplay,
    showRecommended,
    searching,
    dispatch,
    searchQuery,
    selectedSearchOption,
    sortOption,
    sortOptions,
  ]);

  // Calculate paginated data
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = availableRooms.slice(startIndex, endIndex);

  const handleRoomSelection = (room) => {
    return () => {
      if (!room.recommended) {
        setSelectedRoomForModal(room);
        let warnings = [];

        // Check for AV equipment
        if (
          equipments.some((equipment) => equipment.id === "AV") &&
          !room.hasAV
        ) {
          warnings.push(
            <li key="av">
              The meeting requires AV equipment, but it's not available in this
              room.
            </li>,
          );
        }

        // Check for VC equipment
        if (
          equipments.some((equipment) => equipment.id === "VC") &&
          !room.hasVC
        ) {
          warnings.push(
            <li key="vc">
              The meeting requires VC equipment, but it's not available in this
              room.
            </li>,
          );
        }

        // Check if the room is big enough
        if (!room.isBigEnough) {
          warnings.push(
            <li key="size">The room is not big enough for the group.</li>,
          );
        }

        // Construct the JSX message
        let messageJSX = (
          <div>
            {warnings.length > 0 && (
              <div>
                <p>
                  Please review the following{" "}
                  {warnings.length === 1 ? "issue" : "issues"} before
                  proceeding:
                </p>
                <ul className="my-6 text-theme-blue">{warnings}</ul>
              </div>
            )}
            <p className="text-yellow-400">
              This room is not recommended. Are you sure you want to select it?
            </p>
          </div>
        );

        setMessageForModal(messageJSX);
        setIsModalOpen(true);
      } else {
        dispatch(setSelectedRoomForGroup({ groupId: groupToDisplay, room }));
      }
    };
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [showRecommended, searchQuery, sortOption]);

  return (
    <div className="flex flex-col items-center justify-center sm:items-stretch">
      {/* Search Bar */}
      <div className="my-4 flex flex-col items-center justify-between gap-2 sm:m-0 sm:gap-0 lg:flex-row">
        <div className="flex flex-row items-center">
          <div className="flex flex-row items-center">
            <label className="xl:text-md mr-2 text-sm sm:my-4">Search:</label>{" "}
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="xl:text-md h-8 w-36 rounded-lg border-2 border-gray-200 p-2 text-sm  focus:border-gray-500 focus:bg-white focus:outline-none xl:w-44"
            />
          </div>
          <div className="relative ">
            <select
              className="xl:text-md ml-2 h-8 w-24 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 pl-2 pr-8 text-sm focus:border-gray-500 focus:bg-white focus:outline-none xl:w-[125px]"
              name="searchBy"
              id="searchBy"
              value={selectedSearchOption}
              onChange={handleSearchOptionChange}
            >
              <option value="all">All</option>
              <option value="cityId">City</option>
              <option value="buildingCode">Building #</option>
              <option value="roomCode">Room Code</option>
              <option value="roomName">Room Name</option>
              <option value="floorNumber">Floor</option>
              <option value="numberOfSeats">Capacity</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <img
                src={DropdownArrowSVG}
                alt="Dropdown Arrow"
                className="h-5 w-5"
              />
            </div>
          </div>
        </div>

        <div className="ml-2 flex flex-row items-center">
          <label className="xl:text-md text-sm sm:my-4">Sort By:</label>
          <div className="relative ml-2">
            <select
              className="xl:text-md h-8 w-[245px] cursor-pointer appearance-none rounded-lg border-2 border-gray-200 pl-2 pr-8 text-sm focus:border-gray-500 focus:bg-white focus:outline-none xl:w-[200px]"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Smart (Default)</option>
              <option value="floorAsc">Floor (Low to High)</option>
              <option value="floorDesc">Floor (High to Low)</option>
              <option value="roomNumberAsc">Room Code (Low to High)</option>
              <option value="roomNumberDesc">Room Code (High to Low)</option>
              <option value="capacityAsc">Capacity (Low to High)</option>
              <option value="capacityDesc">Capacity (High to Low)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <img
                src={DropdownArrowSVG}
                alt="Dropdown Arrow"
                className="h-5 w-5"
              />
            </div>
          </div>
          <MoreInfo
            info={
              "By default, rooms are smartly sorted prioritizing proximity (closest floors and buildings for all attendees), capacity (most suitable first), and equipment variety (most diverse first). This optimizes your search results, making it the ideal choice for most scenarios."
            }
          />
        </div>
      </div>
      {availableRooms.length > 0 ? ( // If there are available rooms
        <>
          <div className="flex h-[1400px] flex-col gap-4 overflow-y-auto">
            {paginatedData.map((room) => (
              <div
                key={room.roomId}
                className={`flex flex-col justify-between ${room.recommended ? "bg-white" : "bg-zinc-200"} px-5 py-5 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl xl:flex-row`}
              >
                <div className="flex flex-col items-center xl:flex-row">
                  <div className="">
                    <img
                      src={MeetingRoomImg}
                      alt="meeting room"
                      className="h-[20vh] object-cover"
                    />
                  </div>
                  <div className="mt-6 flex flex-col xl:ml-6 xl:mt-0">
                    <div className="mt-2 text-lg text-theme-orange">
                      {`${room.cityId}${room.buildingCode} ${room.floor.toString().padStart(2, "0")}.${room.roomCode} ${room.roomName ? room.roomName : ""} `}{" "}
                    </div>
                    <div className="mt-2">
                      <span className="font-semibold">Equipments:</span>{" "}
                      {room.hasAV && room.hasVC
                        ? "AV / VC"
                        : room.hasAV
                          ? "AV"
                          : room.hasVC
                            ? "VC"
                            : "None"}
                    </div>

                    <div className="mt-2">
                      <span className="font-semibold">Number of Seats:</span>{" "}
                      {room.seats}
                    </div>
                  </div>
                </div>

                <div
                  className="group m-5 flex cursor-pointer  justify-center xl:items-end"
                  onClick={handleRoomSelection(room)}
                >
                  {groupedAttendees.find(
                    (group) => group.groupId === groupToDisplay,
                  )?.selectedRoom?.roomId === room.roomId ? (
                    <div className="flex items-center justify-center">
                      <ImCheckboxChecked className="size-6 text-theme-orange" />
                      <span className="mx-3 text-theme-orange">Select</span>
                      <MoreInfo
                        info={
                          "For multi-room bookings, please go to the next group on the 'Attendee Groups' panel on the left for room selection. After all selections are complete, please click 'Submit' to review your booking details."
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <ImCheckboxUnchecked className="size-6 group-hover:text-theme-orange" />{" "}
                      <span className="ml-3 group-hover:text-theme-orange">
                        Select
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isModalOpen && (
            <JSXMsgModal
              message={messageForModal}
              onConfirm={() => {
                dispatch(
                  setSelectedRoomForGroup({
                    groupId: groupToDisplay,
                    room: selectedRoomForModal,
                  }),
                );
                setIsModalOpen(false);
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
          <Pagination
            count={availableRooms.length}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <img src={StartSearchGIF} alt="Start Search" className="h-96 w-96" />
          <h1 className="text-2xl font-semibold">
            Start searching for available rooms
          </h1>
        </div>
      )}
    </div>
  );
};

export default BookingRoomsDisplay;
