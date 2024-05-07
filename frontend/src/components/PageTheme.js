import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";

const PageTheme = createTheme({
  palette: {
    primary: {
      main: "#f19e38",
    },
  },
});

export default PageTheme;
