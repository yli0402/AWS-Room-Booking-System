import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Loader from "./Loader";
import Message from "./Message";

export default function AutoDropdown({
  label,
  options,
  isLoading,
  error,
  selectedValue,
  setSelectedValue,
  disable = false,
  defaultValue = null,
}) {
  return (
    <div>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        getOptionDisabled={(option) => disable}
        onChange={(event, newValue) => {
          setSelectedValue(newValue);
        }}
        defaultValue={defaultValue}
        value={selectedValue}
        renderOption={(props, option, { selected }) => (
          <li
            {...props}
            className={` p-2 font-amazon-ember text-sm md:text-base ${selected ? "bg-theme-orange text-theme-dark-blue" : "bg-white text-black"}`}
          >
            {isLoading ? <Loader /> : option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required
            size="small"
            InputLabelProps={{
              ...params.InputLabelProps,
              className: `${params.InputLabelProps.className} text-sm md:text-base font-amazon-ember`,
            }}
            inputProps={{
              ...params.inputProps,
              className: `${params.inputProps.className} text-sm md:text-base font-amazon-ember`,
            }}
          />
        )}
      />
      {error && <Message severity="error">{error.data.message}</Message>}
    </div>
  );
}
