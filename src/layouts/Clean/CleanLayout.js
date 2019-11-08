import React, { Component } from "react";
import PropTypes from "prop-types";

import { Footer } from "./Footer";

export default class CleanLayout extends Component {
  componentDidUpdate(e) {
    if (e.history && e.history.action === "PUSH") {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.mainPanel.scrollTop = 0;
    }
  }

  render() {
    const { children } = this.props;

    return (
      <div
        style={{ minHeight: "100vh" }}
        className="dark d-flex flex-column justify-content-center pattern-background-1"
      >
        <div className="center-block w-xxl w-auto-xs p-y-md my-auto">
          {children}
        </div>
        <Footer />
      </div>
    );
  }
}

CleanLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

CleanLayout.defaultProps = {
  children: null
};
