import React, { Component } from "react";
import { Card, CardHeader, CardBody, Table } from "reactstrap";
import T from "i18n-react";
import PropTypes from "prop-types";
import {
  AGENT_STATUS,
  ROUTE_BUNDLE,
  SHIPMENT_STATUS,
  ROUTE_STATUS
} from "common/constants/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import API from "../../components/API/API";
import InlineLoader from "../../components/Loader/InlineLoader";
import SearchBy from "../../components/Search/SearchBy";

class JourneyGuruWidget extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.searchFields = [
      { name: "Name", field: "name", type: "text" },
      { name: "ID", field: "friendlyId", type: "text" }
    ];

    this.state = {
      isLoading: false,
      onRouteAgentStatusId: null,
      agents: [],
      filteredAgents: [],
      selectedFilter: this.searchFields[0],
      searchKeyword: ""
    };

    this.handleFilterChange = (key, value) => {
      this.setState({ [key]: value }, () => {
        const { searchKeyword, selectedFilter } = this.state;
        this.handleSearch(searchKeyword, selectedFilter);
      });
    };

    this.handleSearch = async (data, filter) => {
      const { agents } = this.state;
      let filteredAgents;
      if (data) {
        const { field } = filter;
        filteredAgents = agents.filter(d =>
          String(d[field])
            .toLowerCase()
            .includes(data)
        );
      } else {
        filteredAgents = agents;
      }
      this.setState({
        filteredAgents,
        searchKeyword: data
      });
    };

    this.fetchAgents = () => {
      const params = {
        filter: {
          fields: ["id", "friendlyId", "name"],
          include: { routes: "shipments" },
          where: { statusId: AGENT_STATUS.ON_ROUTE.id }
        }
      };

      this.setState({ isLoading: true });

      this.API.get("/agents", { showLoader: false, params })
        .then(response => {
          this.setState(
            {
              isLoading: false,
              agents: response.data,
              filteredAgents: response.data
            },
            () => {
              const { searchKeyword, selectedFilter } = this.state;
              this.handleSearch(searchKeyword, selectedFilter);
            }
          );
        })
        .catch(() => {});
    };
  }

  componentDidMount() {
    this.fetchAgents();
    this.fetchInterval = setInterval(this.fetchAgents, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    this.API.cancelAllRequests();
  }

  render() {
    const { isLoading, filteredAgents, selectedFilter } = this.state;

    const { onRowClick } = this.props;

    let journeyGuruList;
    if (filteredAgents && filteredAgents.length > 0) {
      const { field: sortField } = selectedFilter;
      filteredAgents.sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1));
      journeyGuruList = filteredAgents.map(item => {
        const agentId = item.friendlyId;
        const agentName = item.name;

        const activeRoute = item.routes.find(
          route => route.statusId === ROUTE_STATUS.ASSIGNED.id
        );

        let activeRouteBundle;
        if (activeRoute) {
          switch (activeRoute.bundleId) {
            case ROUTE_BUNDLE.STOCK_IN_TRANSIT.id:
              activeRouteBundle = ROUTE_BUNDLE.STOCK_IN_TRANSIT.name;
              break;
            case ROUTE_BUNDLE.BULK.id:
              activeRouteBundle = ROUTE_BUNDLE.BULK.name;
              break;
            case ROUTE_BUNDLE.MIX.id:
              activeRouteBundle = ROUTE_BUNDLE.MIX.name;
              break;
            case ROUTE_BUNDLE.SINGLE.id:
              activeRouteBundle = ROUTE_BUNDLE.SINGLE.name;
              break;
            default:
              break;
          }
        }

        let activeShipmentIndex;
        const activeShipment =
          activeRoute &&
          activeRoute.shipments.find((shipment, index) => {
            if (shipment.statusId !== 4 && shipment.statusId !== 5) {
              activeShipmentIndex = index + 1;
              return true;
            }
            return false;
          });

        let indexSuffix;
        switch (activeShipmentIndex) {
          case 1:
            indexSuffix = "st";
            break;
          case 2:
            indexSuffix = "nd";
            break;
          case 3:
            indexSuffix = "rd";
            break;
          default:
            indexSuffix = "th";
            break;
        }

        const totalShipments = activeRoute && activeRoute.shipments.length;

        let activeShipmentStatus;
        if (activeShipment) {
          if (activeShipment.statusId === SHIPMENT_STATUS.CREATED.id) {
            activeShipmentStatus = "Picking-up";
          } else if (
            [
              SHIPMENT_STATUS.PICKED_UP.id,
              SHIPMENT_STATUS.ON_ROUTE.id
            ].includes(activeShipment.statusId)
          ) {
            activeShipmentStatus = "Delivering";
          }
        }

        return (
          <tr
            onClick={e => onRowClick(e, item)}
            key={item.id}
            style={{ cursor: "pointer" }}
          >
            <td className="text-center">{agentId}</td>
            <td>{agentName}</td>
            <td>
              {activeShipment
                ? `${activeShipmentStatus} the ${activeShipmentIndex}${indexSuffix}
                   of ${totalShipments}, on a ${activeRouteBundle}-Route`
                : "Shipment information not available"}
            </td>
          </tr>
        );
      });
    }

    return (
      <Card className="h-100">
        <CardHeader className="p-2">
          <h6 className="font-weight-light mb-0">
            <FontAwesomeIcon icon="user-tie" className="text-info mr-2" />
            {T.translate("liveOperations.journeyGuru.title")}
            <InlineLoader visible={isLoading} className="float-right" />
          </h6>
        </CardHeader>
        <SearchBy
          filters={this.searchFields}
          onSearch={this.handleSearch}
          onDropdownChange={filter =>
            this.handleFilterChange("selectedFilter", filter)
          }
          classes={["on-top", "no-borders"]}
        />
        <CardBody className="table-widget">
          <Table responsive striped hover size="sm">
            <thead>
              <tr>
                <th className="text-center">ID</th>
                <th>Agent</th>
                <th>Shipments</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents && filteredAgents.length > 0 ? (
                journeyGuruList
              ) : (
                <tr>
                  <td colSpan="3">
                    {T.translate("liveOperations.journeyGuru.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  }
}

JourneyGuruWidget.propTypes = {
  onRowClick: PropTypes.func
};

JourneyGuruWidget.defaultProps = {
  onRowClick: () => {}
};

export default JourneyGuruWidget;
