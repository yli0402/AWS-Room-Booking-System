import React from "react";
import AdminUserForm from "../../../components/AdminUserForm";
import FileUpload from "../../../components/FileUpload";
import { useCreateUserMutation } from "../../../slices/usersApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const UserManagementAddPage = () => {
  const firstlyHeader = "User Management";
  const secondaryHeader = "Add User";
  const buttonText = "Confirm";

  const navigate = useNavigate();

  const [createUser, { isLoading, error }] = useCreateUserMutation();
  const handleSubmit = async (formData) => {
    try {
      await createUser(formData).unwrap();
      toast.success("User created");
      navigate("/userManagementPage");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to create user");
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-stretch lg:justify-between">
      <div className="basis-1/2">
        <AdminUserForm
          firstlyHeader={firstlyHeader}
          secondaryHeader={secondaryHeader}
          buttonText={buttonText}
          handleSubmit={handleSubmit}
        />
      </div>

      <div className="relative hidden items-center justify-center lg:flex">
        <div className="absolute h-full  border-l-2 border-dashed border-theme-orange"></div>
        <span className="z-10 bg-white px-2 text-sm text-theme-orange">OR</span>
      </div>

      <div className="relative flex w-full  items-center justify-center lg:hidden">
        <div className="absolute w-5/6 border-t-2 border-dashed border-theme-orange"></div>
        <span className="z-10 bg-white px-2 text-sm text-theme-orange">OR</span>
      </div>
      <FileUpload />
    </div>
  );
};

export default UserManagementAddPage;
