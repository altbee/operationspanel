import React, { Component } from "react";
import classNames from "classnames";
import { Card, CardBody } from "reactstrap";
import T from "i18n-react";
import STATUS from "http-status";
import get from "get-value";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { StatsCard } from "../../components/StatsCard/StatsCard";
import API from "../../components/API/API";
import { AuthProvider } from "../../components/Auth/AuthProvider";

class StatisticsWidget extends Component {
  constructor(props) {
    super(props);

    this.API = new API();
    this.account = new AuthProvider().getUser();

    this.state = {
      isExpanded: false,
      shipmentsCount: "",
      agentsCount: "",
      areasCount: "",
      routesCount: ""
    };

    this.toggleSize = () => {
      const { isExpanded } = this.state;
      this.setState({ isExpanded: !isExpanded });
    };

    this.fetchStatistics = () => {
      const resourcesToCont = ["shipments", "agents", "areas", "routes"];
      resourcesToCont.forEach(resource => {
        const stateToChange = this.state;
        this.API.get(`/${resource}/count`, { showLoader: false })
          .then(res => {
            stateToChange[`${resource}Count`] = res.data.count;
          })
          .catch(reason => {
            if (get(reason, "response.status", 0) === STATUS.NOT_FOUND) {
              stateToChange[`${resource}Count`] = "0";
            } else {
              stateToChange[`${resource}Count`] = T.translate(
                "liveOperations.statistics.notAvailable"
              );
            }
          })
          .finally(() => {
            if (!this.willUnmount) this.setState(stateToChange);
          });
      });
    };
  }

  componentDidMount() {
    this.fetchStatistics();
    this.fetchStatisticsHandle = setInterval(this.fetchStatistics, 10000);
  }

  componentWillUnmount() {
    this.willUnmount = true;
    clearInterval(this.fetchStatisticsHandle);
    this.API.cancelAllRequests();
  }

  render() {
    const {
      shipmentsCount,
      agentsCount,
      areasCount,
      routesCount,
      isExpanded
    } = this.state;

    return (
      <Card
        className={classNames(
          "animated",
          "statistics-widget",
          "box-shadow-z1",
          { flipInY: isExpanded }
        )}
        onClick={this.toggleSize}
      >
        <CardBody className="p-0 scroll d-flex flex-wrap flex-row justify-content-around align-items-center">
          <StatsCard
            icon="shipping-fast"
            small={!isExpanded}
            className="text-success"
            statsText={T.translate("liveOperations.statistics.shipments")}
            statsValue={shipmentsCount}
          />
          <StatsCard
            icon="user-friends"
            small={!isExpanded}
            className="text-info"
            statsText={T.translate("liveOperations.statistics.agents")}
            statsValue={agentsCount}
          />
          <StatsCard
            icon="map-marked-alt"
            small={!isExpanded}
            className="text-warning"
            statsText={T.translate("liveOperations.statistics.areas")}
            statsValue={areasCount}
          />
          <StatsCard
            icon="route"
            small={!isExpanded}
            className="text-danger"
            statsText={T.translate("liveOperations.statistics.routes")}
            statsValue={routesCount}
          />
          <Card className="bg-primary text-light align-self-stretch m-1 ml-0">
            <CardBody className="text-center d-flex align-items-center btn btn-primary px-2">
              <FontAwesomeIcon
                icon={isExpanded ? "chevron-down" : "chevron-up"}
              />
            </CardBody>
          </Card>
        </CardBody>
      </Card>
    );
  }
}

export default StatisticsWidget;
