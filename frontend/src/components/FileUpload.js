import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useUploadUserCSVMutation } from "../slices/usersApiSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import sampleCSV from "../assets/sampleCSV.csv";
import CancelConfirmationModal from "./CancelConfirmationModal";

const FileUpload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadUserCSV, { isLoading, error }] = useUploadUserCSVMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleFileChange = (event) => {
    const file = event.target.files
      ? event.target.files[0]
      : event.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      if (file.size <= MAX_FILE_SIZE) {
        setSelectedFile(file);
      } else {
        alert("The file is too large. Please upload a file smaller than 2MB.");
      }
    } else {
      alert("Only CSV files are allowed.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileChange(event);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    // prepare the file to be sent to the server
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await uploadUserCSV(formData).unwrap();
      toast.success(`${selectedFile.name} uploaded successfully!`);
      navigate("/userManagementPage");
    } catch (err) {
      toast.error(err?.data?.error || "Failed to upload file");
      console.error("Failed to upload file:", err);
    }
    setIsModalOpen(false);
  };

  const requestUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex w-3/4 flex-col items-center justify-center gap-y-4 font-amazon-ember lg:w-1/2">
        <label
          htmlFor="file-upload"
          className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <FaCloudUploadAlt className="mb-2 size-8 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 ">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">CSV file only</p>
            {selectedFile && (
              <p className="mt-4 text-sm font-medium text-theme-blue">
                {selectedFile.name}
              </p>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".csv, text/csv"
          />
        </label>
        <button
          onClick={requestUpload}
          className="cursor-pointer rounded-lg bg-theme-orange px-2 py-1 text-sm text-theme-dark-blue transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange  hover:text-white md:px-4 md:py-2 md:text-base"
        >
          Upload
        </button>
        <a
          href={sampleCSV}
          download="sampleCSV.csv"
          className="cursor-pointer rounded-lg bg-theme-dark-blue px-2 py-1 text-sm text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white md:px-4 md:py-2 md:text-base"
        >
          Download Sample File
        </a>
      </div>
      {isModalOpen && selectedFile && (
        <CancelConfirmationModal
          confirmButton={"Confirm"}
          cancelButton={"Back"}
          message={`Are you sure you want to import all users in ${selectedFile.name}? This cannot be undone.`}
          onConfirm={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default FileUpload;
