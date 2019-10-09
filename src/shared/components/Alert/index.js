import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import View from "./view";
import styles from "./style";

const Alert = props => {
  const { classes, handleClose, message, variant } = props;

  return (
    <View
      classes={classes}
      handleClose={handleClose}
      message={message}
      variant={variant}
    />
  );
};

Alert.propTypes = {
  classes: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired
};

export default withStyles(styles)(Alert);
