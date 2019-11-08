import React from "react";
import SweetAlert from "sweetalert2-react";
import { AuthProvider } from "../../components/Auth/AuthProvider";
import { Route, Redirect, withRouter } from "react-router-dom";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { withAuth, hasRoles } from "../Auth/AuthProvider";
import Loader from "../Loader/Loader";

class AppRoute extends React.Component {
  constructor(props) {
    super(props);

    this.auth = new AuthProvider();

    this.state = {
      showAlert: false,
      errorText: ""
    };

    this.onCloseAlert = () => {
      this.setState({
        showAlert: false,
        errorText: "",
        showLoader: false
      });
    };

    this.onShowAlert = error => {
      const { showAlert, errorText } = this.state;
      if (showAlert === false || errorText !== error) {
        this.setState({ showAlert: true, errorText: error });
      }
    };

    this.onShowLoader = showLoader => {
      this.setState({ showLoader });
    };
  }

  componentWillMount() {
    const { emitter, isModal } = this.props;
    if (!isModal) {
      emitter.on("ShowAlert", this.onShowAlert);
      emitter.on("ShowLoader", this.onShowLoader);
    }
  }

  componentWillUnmount() {
    const { emitter, isModal } = this.props;
    if (!isModal) {
      emitter.removeListener("ShowAlert", this.onShowAlert);
      emitter.removeListener("ShowLoader", this.onShowLoader);
    }
  }

  render() {
    const {
      component: Component,
      layout: Layout,
      emitter,
      isModal,
      modalProps,
      history,
      ...routeProps
    } = this.props;
    const { showAlert, errorText, showLoader } = this.state;
    if (routeProps.auth && routeProps.authRequired) {
      if (!this.auth.getAccessToken()) {
        return (
          <Redirect
            from={routeProps.path}
            to={`/login?redirect=${routeProps.path}`}
          />
        );
      }
      if (routeProps.roles && routeProps.roles.length) {
        const hasRights = hasRoles(routeProps.roles);
        if (!hasRights && !isModal) {
          return <Redirect from={routeProps.path} to="/forbidden" />;
        }
      }
    }

    if (routeProps.redirect) {
      return <Redirect from={routeProps.path} to={routeProps.to} />;
    }

    const alertPopup = (
      <SweetAlert
        show={showAlert}
        title="Error"
        text={errorText}
        type="error"
        confirmButtonText="Ok"
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={this.onCloseAlert}
      />
    );

    if (isModal) {
      const { size, title } = modalProps;
      return (
        <Route
          {...routeProps}
          render={props => (
            <Modal isOpen size={size} className="app-content box-shadow-z0">
              {alertPopup}
              <ModalHeader toggle={history.goBack}>{title}</ModalHeader>
              <ModalBody className="bg-light">
                <Component {...props} emitter={emitter} />
              </ModalBody>
            </Modal>
          )}
        />
      );
    }

    return (
      <Route
        {...routeProps}
        render={props => (
          <Layout>
            {alertPopup}
            <Component {...props} emitter={emitter} />
            <Loader visible={showLoader} />
          </Layout>
        )}
      />
    );
  }
}

export default withRouter(withAuth(AppRoute));
