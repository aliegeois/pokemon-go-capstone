import React from "react";
import PropTypes from "prop-types";
//import get from "lodash/get";
// import { Query } from "services/Client";
import { Grid, withStyles, Paper } from "@material-ui/core";
import IMAGES from "shared/images";
import style from "./style";

const Box = ({ classes, pokemons, trainer, catchPokemon, caught, leaders }) => (
  <Paper className={classes.paper}>
    <Grid container className={classes.root} direction="row">
      <Grid item xs={12}>
        <Grid container>
          {pokemons.map((pokemon, index) => {
            return (
              <Grid item xs={4} key={pokemon.id} style={{ marginBottom: 60 }}>
                {caught[pokemon.id] == trainer.id ? (
                  <img
                    className={classes.image}
                    alt={`pokemon-${index}`}
                    style={{ width: 60, height: 60, marginTop: 40 }}
                    src={IMAGES.POKEBALL}
                  />
                ) : caught[pokemon.id] ? (
                  ""
                ) : (
                  <Grid container direction="column">
                    {leaders[pokemon.id] &&
                    leaders[pokemon.id] == trainer.id ? (
                      <Grid item className={classes.imageContainer}>
                        <img
                          className={classes.image}
                          style={{
                            width: 100,
                            height: 80
                          }}
                          src={IMAGES.STAR}
                        />
                      </Grid>
                    ) : (
                      ""
                    )}
                    <Grid item className={classes.imageContainer}>
                      <img
                        onClick={catchPokemon(trainer, pokemon)}
                        className={classes.image}
                        alt={`pokemon-${index}`}
                        style={{ width: 100 }}
                        src={pokemon.pokemon}
                      />
                    </Grid>
                  </Grid>
                )}
              </Grid>
            );
          })}
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <img
          className={classes.image}
          alt="trainer"
          style={{ width: 100 }}
          src={IMAGES.TRAINER}
        />
        {`trainer-${trainer.id} [${trainer.x},${trainer.y}]`}
      </Grid>
    </Grid>
  </Paper>
);

Box.propTypes = {
  classes: PropTypes.object.isRequired,
  caught: PropTypes.object.isRequired,
  pokemons: PropTypes.array.isRequired,
  trainer: PropTypes.object.isRequired,
  leaders: PropTypes.object.isRequired,
  catchPokemon: PropTypes.func.isRequired
};
export default withStyles(style)(Box);
