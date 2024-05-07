import React from "react";
import { TextField } from "@mui/material";
import MoreInfo from "./MoreInfo";
const AddBuilding = ({
  cityId,
  setCityId,
  buildingCode,
  setBuildingCode,
  address,
  setAddress,
  lon,
  setLon,
  lat,
  setLat,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <TextField
        label="Address"
        value={address}
        size="small"
        required
        variant="standard"
        onChange={(e) => setAddress(e.target.value)}
        InputLabelProps={{
          className: "text-sm md:text-base font-amazon-ember",
        }}
        inputProps={{
          className: "text-sm md:text-base font-amazon-ember",
        }}
      />

      <TextField
        label="City (Airport Code)"
        value={cityId}
        size="small"
        required
        variant="standard"
        onChange={(e) => setCityId(e.target.value)}
        InputLabelProps={{
          className: "text-sm md:text-base font-amazon-ember",
        }}
        inputProps={{
          className: "text-sm md:text-base font-amazon-ember",
        }}
      />
      <div className="relative w-full">
        <label
          htmlFor="buildingCode"
          className="block text-sm font-medium text-gray-700"
        >
          Building Number*
        </label>
        <input
          id="buildingCode"
          aria-label="buildingCode"
          required
          type="number"
          min={1}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-theme-orange focus:outline-none focus:ring-theme-orange sm:text-sm"
          value={buildingCode}
          onChange={(event) => setBuildingCode(event.target.value)}
        />
      </div>

      <div className="relative w-full">
        <div className="flex items-center justify-start">
          <label
            htmlFor="longitude"
            className="block text-sm font-medium text-gray-700"
          >
            Longitude*
          </label>
          <MoreInfo info="You may get the longitude from Google Maps" />
        </div>

        <input
          id="longitude"
          aria-label="longitude"
          required
          type="number"
          step="0.000001" // 6 decimal places
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-theme-orange focus:outline-none focus:ring-theme-orange sm:text-sm"
          value={lon}
          onChange={(event) => setLon(event.target.value)}
        />
      </div>
      <div className="relative w-full">
        <div className="flex items-center justify-start">
          <label
            htmlFor="latitude"
            className="block text-sm font-medium text-gray-700"
          >
            Latitude*
          </label>
          <MoreInfo info="You may get the latitude from Google Maps" />
        </div>
        <input
          id="latitude"
          aria-label="latitude"
          required
          type="number"
          step="0.000001"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-theme-orange focus:outline-none focus:ring-theme-orange sm:text-sm"
          value={lat}
          onChange={(event) => setLat(event.target.value)}
        />
      </div>
    </div>
  );
};

export default AddBuilding;
