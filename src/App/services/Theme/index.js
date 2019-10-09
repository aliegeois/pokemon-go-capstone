import React from "react";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "Poppins",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(",")
  },
  palette: {
    primary: {
      light: "#4ebaaa",
      main: "#315FA4",
      dark: "#2A3D8D",
      contrastText: "#fff"
    },
    secondary: {
      light: "#1abc9c",
      main: "#1abc9c",
      dark: "#16a085",
      contrastText: "#FFF"
    }
  }
});

const Theme = App => {
  const withTheme = props => (
    <MuiThemeProvider theme={theme}>
      <App {...props} />
    </MuiThemeProvider>
  );
  return withTheme;
};

export default Theme;
