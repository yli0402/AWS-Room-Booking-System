// bookingSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { nextDayAtTen, sevenDaysLaterAtMidnight } from "../utils/getDateTime";

const initialState = {
  startDate: nextDayAtTen.format("YYYY-MM-DD"),
  startTime: nextDayAtTen.format("HH:mm"),
  duration: 30,
  unit: "minutes",
  equipments: [],
  priority: [
    {
      id: 1,
      item: "distance",
      description: "Less Walking",
    },
    {
      id: 2,
      item: "seats",
      description: "Right Capacity",
    },
    {
      id: 3,
      item: "equipments",
      description: "Extra Equipments",
    },
  ],
  roomCount: 1,
  groupedAttendees: [],
  ungroupedAttendees: [],
  loggedInUser: {
    group: null,
    selectedRoom: null,
  },
  searchOnce: false,
  loading: false,
  groupToDisplay: "Group 1",
  searching: false,
  showRecommended: true,
  regroup: true,
  isMultiCity: false,
  suggestedTimeMode: false,
  suggestedTimeInput: {
    startTime: nextDayAtTen.format("YYYY-MM-DD HH:mm"),
    endTime: sevenDaysLaterAtMidnight.format("YYYY-MM-DD HH:mm"),
    duration: 30,
    unit: "minutes",
  },
  suggestedTimeReceived: {},
};

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },

    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setUnit: (state, action) => {
      state.unit = action.payload;
    },
    addEquipment: (state, action) => {
      state.equipments = [...state.equipments, action.payload];
    },
    removeEquipment: (state, action) => {
      state.equipments = state.equipments.filter(
        (equip) => equip.id !== action.payload.id,
      );
    },
    setPriority: (state, action) => {
      state.priority = action.payload;
    },
    setRoomCount: (state, action) => {
      state.roomCount = action.payload;
    },
    setGroupedAttendees: (state, action) => {
      const { groupId, attendees } = action.payload;
      const updatedGroupedAttendees = state.groupedAttendees.map((group) =>
        group.groupId === groupId ? { ...group, attendees: attendees } : group,
      );
      state.groupedAttendees = updatedGroupedAttendees;
    },
    initializeGroupedAttendees: (state, action) => {
      state.groupedAttendees = action.payload;
    },
    setSelectedRoomForGroup: (state, action) => {
      const { groupId, room } = action.payload;
      const group = state.groupedAttendees.find((g) => g.groupId === groupId);
      if (group) {
        group.selectedRoom = room;

        // check if the group being updated is the same as the loggedInUser's group
        if (state.loggedInUser.group === groupId) {
          // update the loggedInUser's selectedRoom with the new room details
          state.loggedInUser.selectedRoom = room;
        }
      }
    },

    updateRoomsAndSelectedRoomForGroup: (state, action) => {
      const { groupId, rooms } = action.payload;
      let flag = false; // flat to track the first group needing an update

      state.groupedAttendees.forEach((group, index) => {
        if (group.groupId === groupId) {
          // update rooms for the matching group
          group.rooms = rooms;

          // Check if the selectedRoom exists in the updated rooms list
          const selectedRoomExists = rooms.some(
            (room) => room.roomId === group.selectedRoom?.roomId,
          );

          // If the selectedRoom does not exist in the updated rooms list, set it to null
          group.selectedRoom = selectedRoomExists ? group.selectedRoom : null;

          // For the first group needing update of selectedRoom to null, set groupToDisplay and ensure this happens only once
          if (!selectedRoomExists && !flag) {
            state.groupToDisplay = groupId;
            flag = true;
          }

          // check if the group being updated is the same as the loggedInUser's group
          if (state.loggedInUser.group === groupId) {
            state.loggedInUser.selectedRoom = selectedRoomExists
              ? state.loggedInUser.selectedRoom
              : null;
          }
        }
      });
    },

    setUngroupedAttendees: (state, action) => {
      state.ungroupedAttendees = action.payload;
    },
    setSearchOnce: (state, action) => {
      state.searchOnce = action.payload;
    },
    setLoggedInUserGroup: (state, action) => {
      state.loggedInUser.group = action.payload;

      // set the selectedRoom for the loggedInUser to updated group
      const group = state.groupedAttendees.find(
        (group) => group.groupId === action.payload,
      );
      if (group) {
        state.loggedInUser.selectedRoom = group.selectedRoom;
      }
    },
    setGroupToDisplay: (state, action) => {
      state.groupToDisplay = action.payload;
    },
    startLoading: (state) => {
      state.loading = true;
    },
    stopLoading: (state) => {
      state.loading = false;
    },
    startSearch: (state) => {
      state.searching = true;
    },
    stopSearch: (state) => {
      state.searching = false;
    },
    toggleShowRecommended: (state) => {
      state.showRecommended = !state.showRecommended;
    },
    setRegroup: (state, action) => {
      state.regroup = action.payload;
    },
    setIsMultiCity: (state, action) => {
      state.isMultiCity = action.payload;
    },
    setSuggestedTimeMode: (state, action) => {
      state.suggestedTimeMode = action.payload;
      // if (action.payload) {
      //   // reset suggestedTimeInput when switching to suggestedTimeMode
      //   state.suggestedTimeInput = {
      //     startTime: nextDayAtTen.format("YYYY-MM-DD HH:mm"),
      //     endTime: sevenDaysLaterAtTen.format("YYYY-MM-DD HH:mm"),
      //     duration: 30,
      //     unit: "minutes",
      //   };
      // }
    },
    setSuggestedTimeInput: (state, action) => {
      state.suggestedTimeInput = action.payload;
    },
    setSuggestedTimeReceived: (state, action) => {
      state.suggestedTimeReceived = action.payload;
    },
    resetBooking: (state) => (state = initialState),
  },
});

export const {
  setStartDate,
  setStartTime,
  setDuration,
  setUnit,
  addEquipment,
  removeEquipment,
  setPriority,
  setRoomCount,
  setGroupedAttendees,
  setUngroupedAttendees,
  initializeGroupedAttendees,
  setSearchOnce,
  setLoggedInUserGroup,
  resetBooking,
  startLoading,
  stopLoading,
  setSelectedRoomForGroup,
  setGroupToDisplay,
  startSearch,
  stopSearch,
  toggleShowRecommended,
  setRegroup,
  setIsMultiCity,
  setSuggestedTimeMode,
  setSuggestedTimeInput,
  setSuggestedTimeReceived,
  updateRoomsAndSelectedRoomForGroup,
} = bookingSlice.actions;

export default bookingSlice.reducer;
