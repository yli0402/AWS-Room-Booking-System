import React from "react";
import AdminBuildingForm from "../../../components/AdminBuildingForm";
import {
  useGetBuildingByIdQuery,
  useUpdateBuildingMutation,
} from "../../../slices/buildingsApiSlice";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const BuildingManagementEditPage = () => {
  const firstlyHeader = "Building Management";
  const secondaryHeader = "Edit Building";
  const buttonText = "Confirm";

  const { id: buildingId } = useParams();

  const {
    data: buildingInfo,
    isLoading,
    refetch,
    error,
  } = useGetBuildingByIdQuery(buildingId);

  const [updateBuilding, { isLoading: isUpdating, error: updateError }] =
    useUpdateBuildingMutation();
  const navigate = useNavigate();

  const handleUpdate = async (formData) => {
    try {
      await updateBuilding({ id: buildingId, building: formData }).unwrap();
      toast.success("Building updated successfully!");
      navigate("/buildingManagementPage");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to update building");
      console.log(err);
    }
  };

  return (
    <AdminBuildingForm
      firstlyHeader={firstlyHeader}
      secondaryHeader={secondaryHeader}
      buttonText={buttonText}
      handleSubmit={handleUpdate}
      initialValues={isLoading ? null : buildingInfo}
    />
  );
};

export default BuildingManagementEditPage;
