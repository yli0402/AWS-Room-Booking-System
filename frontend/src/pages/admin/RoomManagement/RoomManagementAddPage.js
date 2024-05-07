import React from "react";
import AdminRoomForm from "../../../components/AdminRoomForm";
import { useCreateRoomMutation } from "../../../slices/roomsApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RoomManagementAddPage = () => {
  const firstlyHeader = "Room Management";
  const secondaryHeader = "Add Room";
  const buttonText = "Confirm";

  const navigate = useNavigate();

  const [createRoom, { isLoading, error }] = useCreateRoomMutation();
  const handleSubmit = async (formData) => {
    try {
      await createRoom(formData).unwrap();
      toast.success("Room created successfully!");
      navigate("/roomManagementPage");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to create room");
    }
  };

  return (
    <AdminRoomForm
      firstlyHeader={firstlyHeader}
      secondaryHeader={secondaryHeader}
      buttonText={buttonText}
      handleSubmit={handleSubmit}
    />
  );
};

export default RoomManagementAddPage;
