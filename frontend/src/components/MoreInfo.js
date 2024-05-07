import React, { useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { IconButton, Tooltip, ClickAwayListener } from "@mui/material";

const MoreInfo = ({ info }) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  return (
    <>
      {" "}
      <div className="md:hidden">
        <ClickAwayListener onClickAway={handleTooltipClose}>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            onClose={handleTooltipClose}
            open={open}
            title={info}
            disableFocusListener
            disableTouchListener
            disableHoverListener
          >
            <IconButton onClick={handleTooltipOpen}>
              <IoInformationCircleOutline />
            </IconButton>
          </Tooltip>
        </ClickAwayListener>
      </div>
      <div className="hidden md:block">
        <Tooltip title={info}>
          <IconButton>
            <IoInformationCircleOutline />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
};

export default MoreInfo;
