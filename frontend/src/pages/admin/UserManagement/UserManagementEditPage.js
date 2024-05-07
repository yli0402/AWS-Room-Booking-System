import React from "react";
import AdminUserForm from "../../../components/AdminUserForm";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../../slices/usersApiSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const UserManagementEditPage = () => {
  const firstlyHeader = "User Management";
  const secondaryHeader = "Edit User";
  const buttonText = "Confirm";

  const { id: userId } = useParams();

  const {
    data: userInfo,
    isLoading,
    refetch,
    error,
  } = useGetUserByIdQuery(userId);
  const [updateUser, { isLoading: isUpdating, error: updateError }] =
    useUpdateUserMutation();

  const navigate = useNavigate();

  const handleUpdate = async (formData) => {
    try {
      await updateUser({ id: userId, user: formData }).unwrap();
      toast.success("User updated successfully!");
      navigate("/userManagementPage");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to update user");
      console.log(err);
    }
  };
  return (
    <AdminUserForm
      firstlyHeader={firstlyHeader}
      secondaryHeader={secondaryHeader}
      buttonText={buttonText}
      handleSubmit={handleUpdate}
      initialValues={isLoading ? null : userInfo}
    />
  );
};

export default UserManagementEditPage;
