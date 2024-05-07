import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRoomCount } from "../slices/bookingSlice";

const UserRoomCountInput = () => {
  const dispatch = useDispatch();
  const { roomCount, searchOnce, roomCountUpdateAfterSearch } = useSelector(
    (state) => state.booking,
  );
  const [roomCountLocal, setRoomCountLocal] = useState(roomCount);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // only allow positive integers
    if (/^([1-9]\d*)?$/.test(inputValue)) {
      setRoomCountLocal(inputValue);
    }
  };

  useEffect(() => {
    setRoomCountLocal(roomCount);
  }, [roomCount]);

  const handleBlur = () => {
    const finalCount = roomCountLocal === "" ? 1 : parseInt(roomCountLocal, 10);
    setRoomCountLocal(finalCount);
    dispatch(setRoomCount(finalCount));
  };

  return (
    <div className="flex w-80 flex-col rounded-lg bg-gray-200 p-4">
      <div className="relative">
        <input
          type="number"
          value={roomCountLocal}
          onChange={handleChange}
          onBlur={handleBlur}
          className="block w-full appearance-none rounded-md bg-white px-4 py-2 pr-8 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
        />
      </div>
    </div>
  );
};

export default UserRoomCountInput;
