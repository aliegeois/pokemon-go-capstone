import React, { PureComponent } from "react";
import { HashRouter as Router } from "react-router-dom";

const myRouter = App =>
  class Routered extends PureComponent {
    render() {
      return (
        <Router>
          <App {...this.props} />
        </Router>
      );
    }
  };

export default myRouter;
