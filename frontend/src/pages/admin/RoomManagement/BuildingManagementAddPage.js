import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminBuildingForm from "../../../components/AdminBuildingForm";
import { useCreateBuildingMutation } from "../../../slices/buildingsApiSlice";

const BuildingManagementAddPage = () => {
  const firstlyHeader = "Building Management";
  const secondaryHeader = "Add Building";
  const buttonText = "Confirm";

  const navigate = useNavigate();

  const [createBuilding, { isLoading, error }] = useCreateBuildingMutation();

  const handleSubmit = async (formData) => {
    try {
      await createBuilding(formData).unwrap();
      toast.success("Building created successfully!");
      navigate("/buildingManagementPage");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to create building");
    }
  };

  return (
    <div>
      <AdminBuildingForm
        firstlyHeader={firstlyHeader}
        secondaryHeader={secondaryHeader}
        buttonText={buttonText}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default BuildingManagementAddPage;
