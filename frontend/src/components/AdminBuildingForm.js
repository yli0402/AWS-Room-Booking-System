import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@mui/system";
import PageTheme from "./PageTheme";
import AddBuilding from "./AddBuilding";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const AdminBuildingForm = ({
  firstlyHeader,
  secondaryHeader,
  buttonText,
  handleSubmit,
  initialValues = {},
}) => {
  const [cityId, setCityId] = useState("");
  const [buildingCode, setBuildingCode] = useState(null);
  const [address, setAddress] = useState("");
  const [lon, setLon] = useState(null);
  const [lat, setLat] = useState(null);

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

  useEffect(() => {
    if (initialValues && initialValues.result) {
      setCityId(initialValues.result.city.cityId);
      setBuildingCode(initialValues.result.code);
      setAddress(initialValues.result.address);
      setLon(initialValues.result.lon);
      setLat(initialValues.result.lat);
    }
  }, [initialValues]);

  const onSubmit = async (e) => {
    e.preventDefault();
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
        handleSubmit(buildingFormData);
      } catch (err) {
        toast.error(err?.data?.error || "Failed to create building");
        return;
      }
    } else {
      const validationErrors = buildingValidation.errors
        .map((error, index) => `${index + 1}. ${error}`)
        .join(" ; ");
      toast.error(`Building data validation failed: ${validationErrors}`);
    }
  };

  return (
    <ThemeProvider theme={PageTheme}>
      <div className="flex  items-center justify-center font-amazon-ember">
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
            <div className="relative mt-8">
              <button className="mr-2 cursor-pointer rounded-lg bg-theme-orange px-2 py-1 font-amazon-ember text-sm text-theme-dark-blue transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange hover:text-white  md:px-4 md:py-2 md:text-base">
                {buttonText}
              </button>
              <Link
                to="/buildingManagementPage"
                className="ml-4 rounded-lg bg-theme-dark-blue px-2 py-1.5 font-amazon-ember text-sm text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white md:px-9 md:py-2.5 md:text-base"
              >
                Back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminBuildingForm;
