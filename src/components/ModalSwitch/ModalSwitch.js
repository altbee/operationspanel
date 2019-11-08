import React, { Component } from "react";
import { Switch } from "react-router";
import AppRoute from "../AppRoute/AppRoute";
import indexRoutes from "../../routes/index";

class ModalSwitch extends Component {
  constructor(props) {
    super(props);

    const { location } = this.props;
    this.previousLocation = location;
  }

  componentWillUpdate(nextProps) {
    const { location } = this.props;

    if (
      nextProps.history.action !== "POP" &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = location;
    }
  }

  render() {
    const { location, emitter } = this.props;

    const isModal =
      location.state &&
      location.state.modal &&
      this.previousLocation !== location;

    let modalProps;
    if (isModal) {
      modalProps = {
        size: location.state.modalSize || "lg",
        title: location.state.modalTitle || ""
      };
    }

    return (
      <div>
        <Switch location={isModal ? this.previousLocation : location}>
          {indexRoutes.map(route => (
            <AppRoute key={route.name} emitter={emitter} {...route} />
          ))}
        </Switch>
        {isModal
          ? indexRoutes
              .filter(route => route.path !== "/")
              .map(route => (
                <AppRoute
                  key={route.name}
                  emitter={emitter}
                  {...route}
                  isModal
                  modalProps={modalProps}
                />
              ))
          : null}
      </div>
    );
  }
}

export default ModalSwitch;
