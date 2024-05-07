import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import { ThemeProvider } from "@mui/system";
import PageTheme from "./PageTheme";
import AutoDropdown from "./AutoDropdown";
import ToggleBuilding from "./ToggleBuilding";
import AddBuilding from "./AddBuilding";
import {
  useGetBuildingsQuery,
  useCreateBuildingMutation,
} from "../slices/buildingsApiSlice";
import MoreInfo from "./MoreInfo";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const AdminUserForm = ({
  firstlyHeader,
  secondaryHeader,
  buttonText,
  handleSubmit,
  initialValues = {},
}) => {
  const { data: buildings, error, isLoading, refetch } = useGetBuildingsQuery();
  const [createBuilding, { isLoading: isBuildingLoading }] =
    useCreateBuildingMutation();

  const [extBuilding, setExtBuilding] = useState(true);
  const [building, setBuilding] = useState(null);
  const [buildingId, setBuildingId] = useState(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [floor, setFloor] = useState(null);
  const [desk, setDesk] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [role, setRole] = useState("staff");

  const [cityId, setCityId] = useState("");
  const [buildingCode, setBuildingCode] = useState(null);
  const [address, setAddress] = useState("");
  const [lon, setLon] = useState(null);
  const [lat, setLat] = useState(null);

  useEffect(() => {
    setBuildingId(building?.value);
  }, [building]);

  useEffect(() => {
    if (initialValues && initialValues.result) {
      setUsername(initialValues.result.username);
      setFirstName(initialValues.result.firstName);
      setLastName(initialValues.result.lastName);
      setEmail(initialValues.result.email);
      setFloor(initialValues.result.floor);
      setDesk(initialValues.result.desk);
      setRole(initialValues.result.role);
      setIsActive(initialValues.result.isActive);

      if (buildings && initialValues.result.building) {
        const initialBuilding = buildings.result.find(
          (b) => b.buildingId === initialValues.result.building.buildingId,
        );
        if (initialBuilding) {
          setBuilding({
            label: `${initialBuilding.city.cityId} ${initialBuilding.code}`,
            value: initialBuilding.buildingId,
          });
        }
      }
    }
  }, [initialValues, buildings]);

  const validateUserData = (data) => {
    const errors = [];

    if (!Number.isInteger(data.floor) || data.floor <= 0) {
      errors.push("invalid floor number");
    }

    if (!Number.isInteger(data.desk) || data.desk <= 0) {
      errors.push("invalid desk number");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateBuildingData = (data) => {
    const errors = [];

    if (!Number.isInteger(data.code) || data.code < 0) {
      errors.push("invalid building number");
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let buildingIdLocal = null;
    if (extBuilding) {
      buildingIdLocal = buildingId;
    }
    if (!extBuilding) {
      const buildingFormData = {
        city: { cityId },
        code: parseInt(buildingCode),
        address,
        lon: parseFloat(lon),
        lat: parseFloat(lat),
        isActive: true,
      };

      const buildingValidation = validateBuildingData(buildingFormData);
      if (buildingValidation.isValid) {
        try {
          const buildingData = await createBuilding(buildingFormData).unwrap();
          buildingIdLocal = buildingData?.result.buildingId;
        } catch (err) {
          toast.error(err?.data?.error || "Failed to create building");
          return;
        }
      } else {
        const validationErrors = buildingValidation.errors
          .map((error, index) => `${index + 1}. ${error}`)
          .join(" ; ");
        toast.error(`Building data validation failed: ${validationErrors}`);
        return;
      }
    }

    if (buildingIdLocal) {
      const userFormData = {
        building: { buildingId: buildingIdLocal },
        username,
        firstName,
        lastName,
        email,
        role,
        floor: parseInt(floor),
        desk: parseInt(desk),
        isActive,
      };
      const userValidation = validateUserData(userFormData);
      if (userValidation.isValid) {
        handleSubmit(userFormData);
      } else {
        const validationErrors = userValidation.errors
          .map((error, index) => `${index + 1}. ${error}`)
          .join(" ; ");

        toast.error(`User data validation failed: ${validationErrors}`);
      }
    }
  };

  return (
    <ThemeProvider theme={PageTheme}>
      <div className="flex  flex-col items-center justify-center font-amazon-ember">
        <div className="group relative  pl-3">
          <div className="absolute inset-0 transform rounded-3xl bg-gradient-to-br from-orange-300 to-theme-orange shadow-lg duration-300 group-hover:-rotate-3 sm:group-hover:-rotate-6"></div>
          <form
            onSubmit={onSubmit}
            className="relative flex-col rounded-3xl bg-white p-4 shadow-lg sm:p-10"
          >
            <h1 className="px-10 text-center text-xl text-theme-dark-blue sm:px-20 md:px-32 md:text-2xl">
              {firstlyHeader}
            </h1>
            <h1 className="px-10 text-center text-sm text-gray-600  sm:px-20 md:px-32 md:text-base">
              {secondaryHeader}
            </h1>

            {/* text field */}
            <div className="space-y-4 py-8 text-sm text-gray-700">
              <div className="relative">
                <div className="flex justify-between gap-x-8">
                  <TextField
                    id="firstName"
                    label="First Name"
                    size="small"
                    required
                    variant="standard"
                    className="w-full"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    InputLabelProps={{
                      className: "text-sm md:text-base font-amazon-ember",
                    }}
                    inputProps={{
                      className: "text-sm md:text-base font-amazon-ember",
                    }}
                  />

                  <TextField
                    id="lastName"
                    label="Last Name"
                    size="small"
                    required
                    variant="standard"
                    className="w-full"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    InputLabelProps={{
                      className: "text-sm md:text-base font-amazon-ember",
                    }}
                    inputProps={{
                      className: "text-sm md:text-base font-amazon-ember",
                    }}
                  />
                </div>
              </div>

              <div className="relative">
                <TextField
                  id="email"
                  label="Email"
                  size="small"
                  type="email"
                  required
                  variant="standard"
                  className="w-full"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  InputLabelProps={{
                    className: "text-sm md:text-base font-amazon-ember",
                  }}
                  inputProps={{
                    className: "text-sm md:text-base font-amazon-ember",
                  }}
                />
              </div>
              <div className="relative">
                <TextField
                  id="username"
                  label="UNIX Username"
                  size="small"
                  type="text"
                  required
                  variant="standard"
                  className="w-full"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  InputLabelProps={{
                    className: "text-sm md:text-base font-amazon-ember",
                  }}
                  inputProps={{
                    className: "text-sm md:text-base font-amazon-ember",
                  }}
                />
              </div>

              <div className="relative flex h-[40px] items-center">
                <label
                  onClick={() => setRole("staff")}
                  className={`mr-2  cursor-pointer ${role === "staff" ? "text-black" : "text-gray-400"}`}
                >
                  Staff
                </label>

                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    if (role === "staff") {
                      setRole("admin");
                    } else {
                      setRole("staff");
                    }
                  }}
                >
                  <div
                    className={`block h-8 w-14 rounded-full ${role === "staff" ? "bg-gray-300" : "bg-orange-300"}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 h-6 w-6 rounded-full transition ${role === "staff" ? "bg-gray-400" : "translate-x-6 transform bg-theme-dark-orange"}`}
                  ></div>
                </div>
                <label
                  onClick={() => setRole("admin")}
                  className={`ml-2  cursor-pointer ${role === "staff" ? "text-gray-400" : "text-theme-dark-orange"}`}
                >
                  Admin
                </label>
                <MoreInfo info={"You can promote a staff user to an admin at any time. However, once a user is an admin, their role cannot be changed, and they cannot be edited/deactivated by another admin."} />
              </div>

              {/* Toggle Existing/New building */}
              {/* <ToggleBuilding
                extBuilding={extBuilding}
                setExtBuilding={setExtBuilding}
                setBuilding={setBuilding}
              /> */}
              {extBuilding ? (
                <div className="relative">
                  <div className="flex justify-between">
                    {/* Autocomplete */}
                    <div className="grow">
                      <AutoDropdown
                        label="Building"
                        options={
                          isLoading
                            ? [{ label: "Loading...", value: null }]
                            : error
                              ? [
                                  {
                                    label: "Error fetching buildings",
                                    value: null,
                                  },
                                ]
                              : buildings.result
                                  .filter((building) => building.isActive)
                                  .map((building) => ({
                                    label: `${building.city.cityId} ${building.code}`,
                                    value: building.buildingId,
                                  }))
                        }
                        isLoading={isLoading}
                        error={error}
                        selectedValue={building}
                        setSelectedValue={setBuilding}
                        className="w-full"
                      />
                    </div>

                    <MoreInfo
                      info={"City (Airport Code) | Building Number"}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <AddBuilding
                    cityId={cityId}
                    setCityId={setCityId}
                    buildingCode={buildingCode}
                    setBuildingCode={setBuildingCode}
                    address={address}
                    setAddress={setAddress}
                    lon={lon}
                    setLon={setLon}
                    lat={lat}
                    setLat={setLat}
                  />
                </div>
              )}

              <div className="relative flex justify-between gap-x-8">
                <div className="w-full">
                  <label
                    htmlFor="floor"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Floor*
                  </label>
                  <input
                    id="floor"
                    aria-label="Floor"
                    required
                    type="number"
                    min={1}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-theme-orange focus:outline-none focus:ring-theme-orange sm:text-sm"
                    value={floor}
                    onChange={(event) => setFloor(event.target.value)}
                  />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="desk"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Desk*
                  </label>
                  <input
                    id="desk"
                    aria-label="Desk"
                    required
                    type="number"
                    min={1}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 shadow-sm focus:border-theme-orange focus:outline-none focus:ring-theme-orange sm:text-sm"
                    value={desk}
                    onChange={(event) => setDesk(event.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <button className="mr-4 cursor-pointer rounded-lg bg-theme-orange px-2 py-1 text-sm text-theme-dark-blue transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange  hover:text-white md:px-4 md:py-2 md:text-base">
                  {buttonText}
                </button>
                <Link
                  to="/userManagementPage"
                  className="ml-4 rounded-lg bg-theme-dark-blue px-2 py-1.5 font-amazon-ember text-sm text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white md:px-12 md:py-2.5 md:text-base"
                >
                  Back
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminUserForm;
