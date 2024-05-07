import React from "react";
import { Alert, Stack } from "@mui/material";
import PropTypes from "prop-types";

const Message = ({ severity, children }) => {
  return (
    <Stack sx={{ width: "100%" }} spacing={2}>
      <Alert severity={severity}>{children}</Alert>
    </Stack>
  );
};

Message.propTypes = {
  severity: PropTypes.string,
};

export default Message;
