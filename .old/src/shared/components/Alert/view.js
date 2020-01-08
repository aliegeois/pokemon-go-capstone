import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const View = props => {
  const { classes, handleClose, message, variant } = props;
  const Icon = variantIcon[variant];

  return (
    <div>
      <Snackbar
        onClick={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
        open={true}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <SnackbarContent
          className={classNames(classes[variant], classes)}
          aria-describedby="client-snackbar"
          message={
            <span id="client-snackbar" className={classes.message}>
              <Icon className={classNames(classes.icon, classes.iconVariant)} />
              {message}
            </span>
          }
        />
      </Snackbar>
    </div>
  );
};

View.propTypes = {
  classes: PropTypes.object.isRequired,
  handleClose: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.string.isRequired
};

export default View;
