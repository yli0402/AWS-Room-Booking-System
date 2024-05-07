import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addEquipment, removeEquipment } from "../slices/bookingSlice";

const UserEquipInput = () => {
  const dispatch = useDispatch();
  const selectedEquipments = useSelector((state) => state.booking.equipments);
  const equipments = [
    { id: "AV", description: "Audio/Visual (AV)" },
    { id: "VC", description: "Video Conference (VC)" },
  ];
  const handleEquipmentChange = (e, item) => {
    if (e.target.checked) {
      dispatch(addEquipment(item));
    } else {
      dispatch(removeEquipment(item));
    }
  };
  return (
    <div className="flex w-80 flex-col  gap-2 rounded-lg bg-gray-200 p-4 ">
      {equipments.map((item) => (
        <div
          key={item.id}
          className="flex gap-x-4 rounded-md bg-white  px-4 py-2 pr-8 leading-tight text-gray-700"
        >
          <label
            className="relative flex cursor-pointer items-center rounded-full"
            htmlFor={item.id}
          >
            <input
              type="checkbox"
              className="peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-700 transition-all  checked:border-theme-orange checked:bg-theme-orange "
              id={item.id}
              checked={selectedEquipments.some((equip) => equip.id === item.id)}
              onChange={(e) => handleEquipmentChange(e, item)}
            />
            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-theme-dark-blue opacity-0 transition-opacity peer-checked:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </span>
          </label>
          <label
            className="cursor-pointer select-none text-theme-dark-blue"
            htmlFor={item.id}
          >
            {item.description}
          </label>
        </div>
      ))}
    </div>
  );
};

export default UserEquipInput;
