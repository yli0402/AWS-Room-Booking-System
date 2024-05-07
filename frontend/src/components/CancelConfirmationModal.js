import React from "react";

export const CancelConfirmationModal = ({
  onCancel,
  onClose,
  onConfirm,
  message,
  confirmButton,
  cancelButton,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-80 flex-col rounded-3xl bg-white p-6 shadow-lg xl:w-[400px]">
        <div className="flex flex-col">
          <h1 className="font-natural text-md m-2">{message}</h1>
          <div className="mt-4 flex justify-center gap-3">
            <button
              className="h-8 rounded bg-theme-orange px-4 text-theme-dark-blue transition-colors duration-300 ease-in-out hover:bg-theme-dark-orange hover:text-white xl:h-10 xl:min-w-28"
              onClick={onConfirm}
            >
              {confirmButton}
            </button>
            <button
              className="h-8 rounded bg-theme-dark-blue px-4 text-white transition-colors duration-300 ease-in-out hover:bg-theme-blue hover:text-white xl:h-10 xl:min-w-28"
              onClick={onCancel}
            >
              {cancelButton}
            </button>
          </div>
        </div>
        {/* <button
          className="absolute right-2 top-2 cursor-pointer p-2"
          onClick={onClose}
        >
          <img
            src={CloseIconSVG}
            alt="Close Icon"
            className="size-5 xl:size-6"
          />
        </button> */}
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
