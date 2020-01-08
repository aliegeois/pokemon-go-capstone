import React from "react";
import Proptypes from "prop-types";
import { Switch, Route } from "react-router";
import { withStyles } from "@material-ui/core";

import { addHocs } from "shared/helpers/component";
// import Notification from "services/Notification/body";
import NotFound from "screens/NotFound";
import Home from "screens/Home";

import Router from "./services/Router";
import Theme from "./services/Theme";
import style from "./style";

const App = props => {
  const { classes } = props;
  return (
    <div className={classes.root} style={{ overflow: "auto", height: "100%" }}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
};

App.propTypes = {
  classes: Proptypes.object.isRequired
};
export default addHocs(App, [withStyles(style), Theme, Router]);
