import React, { Component } from "react";
import PropTypes from "prop-types";

import { HeaderProvider } from "../../components/HeaderProvider/HeaderProvider";
import Header from "./Header";
import { Footer } from "./Footer";
import Sidebar from "./Sidebar";

export default class OperationsTeamLayout extends Component {
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
      <HeaderProvider>
        <Sidebar />
        <div id="content" className="app-content box-shadow-z0" role="main">
          <Header />
          <Footer />
          <div
            id="view"
            className="app-body"
            ref={component => {
              this.mainPanel = component;
            }}
          >
            {children}
          </div>
        </div>
      </HeaderProvider>
    );
  }
}

OperationsTeamLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

OperationsTeamLayout.defaultProps = {
  children: null
};
