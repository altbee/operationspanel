import React, { Component } from "react";
import PropTypes from "prop-types";

const HeaderContext = React.createContext();

class HeaderProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHeaderVisible: true,
      isSidebarOpen: false,
      title: "",
      subTitle: "",
      actions: null
    };

    this.hideHeader = () => {
      this.setState({ isHeaderVisible: false });
    };

    this.showHeader = () => {
      this.setState({ isHeaderVisible: true });
    };

    this.toggleSidebar = () => {
      const { isSidebarOpen } = this.state;
      this.setState({ isSidebarOpen: !isSidebarOpen });
    };

    this.setTitle = (title, subTitle) => {
      const { subTitle: oldSubTitle } = this.state;
      this.setState({
        title: title,
        subTitle: subTitle !== null ? subTitle : oldSubTitle
      });
    };

    this.setSubtitle = subTitle => {
      this.setState({ subTitle });
    };

    this.setActions = actions => {
      this.setState({ actions });
    };
  }

  render() {
    const {
      isHeaderVisible,
      isSidebarOpen,
      title,
      subTitle,
      actions
    } = this.state;
    const { children } = this.props;
    return (
      <HeaderContext.Provider
        value={{
          isHeaderVisible,
          isSidebarOpen,
          title,
          subTitle,
          actions,
          hideHeader: this.hideHeader,
          showHeader: this.showHeader,
          toggleSidebar: this.toggleSidebar,
          setTitle: this.setTitle,
          setSubtitle: this.setSubtitle,
          setActions: this.setActions
        }}
      >
        {children}
      </HeaderContext.Provider>
    );
  }
}

HeaderProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

HeaderProvider.defaultProps = {
  children: null
};

const HeaderConsumer = HeaderContext.Consumer;

const withHeader = ChildComponent => {
  const HeaderComponent = props => (
    <HeaderContext.Consumer>
      {value => <ChildComponent {...props} header={value} />}
    </HeaderContext.Consumer>
  );
  return HeaderComponent;
};

export { HeaderProvider, HeaderConsumer, withHeader };
export default HeaderProvider;
