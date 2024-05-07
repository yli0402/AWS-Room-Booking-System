import React from "react";

const ToggleBuilding = ({ extBuilding, setExtBuilding, setBuilding }) => {
  return (
    <div className="relative h-8 w-2/3 rounded-md bg-gray-200 md:h-10">
      <div className="flex h-full w-full items-center">
        <div
          className={
            "flex w-full cursor-pointer justify-center text-[9px] text-gray-400 sm:text-xs md:text-sm"
          }
          onClick={() => {
            setExtBuilding(true);
            setBuilding(null);
          }}
        >
          Existing building
        </div>
        <div
          className={
            "flex w-full cursor-pointer justify-center  text-[9px] text-gray-400 sm:text-xs md:text-sm"
          }
          onClick={() => {
            setExtBuilding(false);
            setBuilding(null);
          }}
        >
          New building
        </div>
      </div>

      <span
        className={`absolute top-[4px] mx-1 flex h-6 w-[calc(50%-0.25rem)] transform items-center justify-center rounded bg-white text-[9px] shadow transition-transform duration-300 sm:text-xs md:h-8 md:text-sm  ${extBuilding ? "translate-x-0" : "translate-x-full"} text-indigo-600`}
      >
        {extBuilding ? "Existing building" : "New building"}
      </span>
    </div>
  );
};

export default ToggleBuilding;
