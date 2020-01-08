import React, { PureComponent } from "react";
import PropTypes from "prop-types";
//import get from "lodash/get";
// import { Query } from "services/Client";
import { Grid, withStyles, Button, TextField } from "@material-ui/core";
import style from "./style";

class Form extends PureComponent {
  state = {
    x: 0,
    y: 0
  };
  handleChange = field => e => {
    this.setState({ [field]: e.target.value });
  };

  render() {
    const { classes, onSubmit } = this.props;
    return (
      <Grid container>
        <Grid item xs={2}>
          <TextField
            type="number"
            className={classes.textField}
            label="X"
            onChange={this.handleChange("x")}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            type="number"
            className={classes.textField}
            label="Y"
            onChange={this.handleChange("y")}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={onSubmit(this.state)}
          >
            Add Trainer
          </Button>
        </Grid>
      </Grid>
    );
  }
}

Form.propTypes = {
  classes: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
};
export default withStyles(style)(Form);
