import React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const theme = createTheme({
  palette: {
    primary: {
      main: "#f19e38",
    },
  },
});

const BookingStepper = ({ currentStage }) => {
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  const steps = ["Login", "Booking", "Review", "Complete"];
  const [activeStep, setActiveStep] = React.useState(currentStage);

  // const handleStepClick = (step) => {
  //   if (step <= activeStep) {
  //     setActiveStep(step);
  //     if (step === 0) {
  //       navigate("/login");
  //     } else if (step === 1) {
  //       navigate("/booking");
  //     } else if (step === 2) {
  //       navigate("/bookingReview");
  //     } else if (step === 3) {
  //       navigate("/bookingComplete");
  //     }
  //   }
  // };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: "100%" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    fontSize: matches ? "12px" : "16px",
                    fontWeight: "bold",
                    fontFamily: "AmazonEmber",
                  },
                  "& .MuiStepIcon-root": {
                    backgroundColor: "#252f3d",
                    borderRadius: "50%",
                    width: matches ? 30 : 40,
                    height: matches ? 30 : 40,
                    marginTop: "-6px",
                    "& .MuiStepIcon-text": {
                      fill: "white",
                    },
                    position: "relative",
                    transition: "transform 0.5s",
                    zIndex: 1,
                  },
                  "& .MuiStepIcon-root.Mui-active": {
                    marginTop: matches ? "-10px" : "-15px",
                    width: matches ? 40 : 50,
                    height: matches ? 40 : 50,
                    transition: "transform 0.5s",
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </ThemeProvider>
  );
};

export default BookingStepper;
