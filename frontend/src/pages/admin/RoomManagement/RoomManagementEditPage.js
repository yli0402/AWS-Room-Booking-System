import React from "react";
import AdminRoomForm from "../../../components/AdminRoomForm";
import {
  useGetRoomByIdQuery,
  useUpdateRoomMutation,
} from "../../../slices/roomsApiSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const RoomManagementEditPage = () => {
  const firstlyHeader = "Room Management";
  const secondaryHeader = "Edit Room";
  const buttonText = "Confirm";

  const { id: roomId } = useParams();

  const {
    data: roomInfo,
    isLoading,
    refetch,
    error,
  } = useGetRoomByIdQuery(roomId);
  const [updateRoom, { isLoading: isUpdating, error: updateError }] =
    useUpdateRoomMutation();
  const navigate = useNavigate();

  const handleUpdate = async (formData) => {
    try {
      await updateRoom({ id: roomId, room: formData }).unwrap();
      toast.success("Room updated successfully!");
      navigate("/roomManagementPage");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to update room");
      console.log(err);
    }
  };

  return (
    <AdminRoomForm
      firstlyHeader={firstlyHeader}
      secondaryHeader={secondaryHeader}
      buttonText={buttonText}
      handleSubmit={handleUpdate}
      initialValues={isLoading ? null : roomInfo}
    />
  );
};

export default RoomManagementEditPage;
