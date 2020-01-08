import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import IMAGES from "shared/images";
//import get from "lodash/get";
// import { Query } from "services/Client";
import {
  Grid,
  withStyles,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@material-ui/core";
import style from "./style";

class Form extends PureComponent {
  state = {
    x: 0,
    y: 0,
    perimeter: 0,
    pokemon: ""
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
          <TextField
            type="number"
            className={classes.textField}
            label="Perimeter"
            onChange={this.handleChange("perimeter")}
          />
        </Grid>
        <Grid item xs={3}>
          <FormControl className={classes.select}>
            <InputLabel htmlFor="pokemon">Select a Pokemon</InputLabel>
            <Select
              inputProps={{ id: "pokemon" }}
              value={this.state.pokemon}
              onChange={this.handleChange("pokemon")}
            >
              {Object.keys(IMAGES.POKEMONS).map((name, index) => {
                return (
                  <MenuItem key={index} value={IMAGES.POKEMONS[name]}>
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={onSubmit(this.state)}
          >
            Spawn Pokemon
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
