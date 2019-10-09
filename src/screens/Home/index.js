import React, { Component } from "react";
import PropTypes from "prop-types";
//import get from "lodash/get";
// import { Query } from "services/Client";
import { withStyles, Grid, Paper } from "@material-ui/core";
// import withFogletTemplate from "services/FogletTemplate";
import withFoglet from "services/FogletLeVrai";

import { Trainer, Pokemon } from "./components/Forms";
import Box from "./components/Box";
import style from "./style";

class Home extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    addTarget: PropTypes.func.isRequired,
    addNode: PropTypes.func.isRequired,
    getTarget: PropTypes.func.isRequired,
    nodeTargets: PropTypes.object.isRequired,
    caught: PropTypes.object.isRequired,
    nodes: PropTypes.array.isRequired,
    leaders: PropTypes.object.isRequired
  };
  render() {
    const {
      classes,
      addTarget,
      addNode,
      nodeTargets,
      nodes,
      caught,
      getTarget,
      leaders
    } = this.props;
    return (
      <Grid item xs={12}>
        <Grid
          container
          spacing={16}
          className={classes.root}
          direction="column"
        >
          <Grid item>
            <Paper className={classes.paper}>
              <Grid container direction="column">
                <Grid item style={{ marginBottom: "20px" }}>
                  <Trainer onSubmit={addNode} />
                </Grid>
                <Grid item>
                  <Pokemon onSubmit={addTarget} />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid key={2} item>
            <Grid container spacing={8} direction="row">
              {nodes.map(trainer => {
                const targets = nodeTargets[trainer.id] || [];
                return (
                  <Grid item xs={4} key={trainer.id}>
                    <Box
                      pokemons={targets}
                      leaders={leaders[trainer.id] || {}}
                      trainer={trainer}
                      catchPokemon={getTarget}
                      caught={caught}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

// export default withFogletTemplate(withStyles(style)(Home));
export default withFoglet(withStyles(style)(Home));
