import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

const styles = theme => ({
  paper: {
    position: "absolute",
    width: theme.spacing.unit * 50,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4
  }
});

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`
  };
}

class MyModal extends React.Component {
  render() {
    const { classes, opened, title, body, onAccept, onDeny } = this.props;
    return (
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={opened}
        onClose={this.handleClose}
      >
        <Grid
          style={getModalStyle()}
          className={classes.paper}
          container
          direction="column"
          spacing={16}
        >
          <Grid xs={12} item>
            <Typography variant="h6" id="modal-title">
              {title}
            </Typography>
          </Grid>
          <Grid xs={12} item>
            <Typography variant="subtitle1" id="simple-modal-description">
              {body}
            </Typography>
          </Grid>
          <Grid xs={12} item container direction="row" justify="space-between">
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
                onClick={onDeny}
              >
                No
              </Button>
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={onAccept}
              >
                Yes
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
    );
  }
}

MyModal.propTypes = {
  classes: PropTypes.object.isRequired,
  onAccept: PropTypes.func.isRequired,
  onDeny: PropTypes.func.isRequired,
  opened: PropTypes.bool,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired
};

MyModal.defaultProps = {
  opened: false
};

export default withStyles(styles)(MyModal);
