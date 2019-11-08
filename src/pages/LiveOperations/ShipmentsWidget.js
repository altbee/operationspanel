import React, { Component } from "react";
import { Card, CardHeader, CardBody, Table } from "reactstrap";
import moment from "moment";
import { Link } from "react-router-dom";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import API from "../../components/API/API";
import InlineLoader from "../../components/Loader/InlineLoader";
import SearchBy from "../../components/Search/SearchBy";

class ShipmentsWidget extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.searchFields = [
      { name: "Status", field: "statusName", type: "text" },
      { name: "Partner", field: "partnerName", type: "text" },
      { name: "Tracking ID", field: "trackingId", type: "text" }
    ];

    this.state = {
      isLoading: false,
      resourceNameOnApi: "shipments",
      shipments: [],
      filteredShipments: [],
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
      const { shipments } = this.state;
      const { field } = filter;
      let filteredShipments;
      if (data) {
        filteredShipments = shipments.filter(shipment => {
          let filtered = false;
          switch (field) {
            case "statusName": {
              if (shipment.status) {
                filtered = shipment.status.name.toLowerCase().includes(data);
              }
              break;
            }
            case "partnerName": {
              if (shipment.partner) {
                filtered = shipment.partner.name.toLowerCase().includes(data);
              }
              break;
            }
            default: {
              filtered = String(shipment[field])
                .toLowerCase()
                .includes(data);
              break;
            }
          }
          return filtered;
        });
      } else {
        filteredShipments = shipments;
      }

      filteredShipments.sort((first, second) => {
        let firstComp = "";
        let secondComp = "";
        switch (field) {
          case "statusName":
            if (first.status) {
              firstComp = first.status.name.toLowerCase();
            }
            if (second.status) {
              secondComp = second.status.name.toLowerCase();
            }
            break;
          case "partnerName":
            if (first.partner) {
              firstComp = first.partner.name.toLowerCase();
            }
            if (second.partner) {
              secondComp = second.partner.name.toLowerCase();
            }
            break;
          default:
            firstComp = String(first[field]).toLowerCase();
            secondComp = String(second[field]).toLowerCase();
            break;
        }
        if (firstComp < secondComp) {
          return -1;
        }
        if (firstComp > secondComp) {
          return 1;
        }
        return 0;
      });

      this.setState({
        filteredShipments,
        searchKeyword: data
      });
    };

    this.fetchShipments = () => {
      const startDate = moment();
      const endDate = moment().add(1, "day");
      const params = {
        filter: {
          include: ["status", "partner"],
          where: {
            or: [
              {
                createdAt: {
                  between: [startDate, endDate]
                }
              },
              {
                pickupDatetime: {
                  between: [startDate, endDate]
                }
              },
              {
                deliveryDatetime: {
                  between: [startDate, endDate]
                }
              }
            ]
          }
        }
      };

      this.setState({ isLoading: true });

      this.API.get("/shipments", { showLoader: false, params })
        .then(response => {
          this.setState(
            {
              isLoading: false,
              shipments: response.data,
              filteredShipments: response.data
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
    this.fetchShipments();
    this.fetchInterval = setInterval(this.fetchShipments, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    this.API.cancelAllRequests();
  }

  render() {
    const { filteredShipments, isLoading } = this.state;

    return (
      <Card className="h-100">
        <CardHeader className="p-2">
          <h6 className="font-weight-light mb-0">
            <FontAwesomeIcon
              icon="shipping-fast"
              className="text-success mr-2"
            />
            {T.translate("liveOperations.shipments.title")}
            <InlineLoader visible={isLoading} className="float-right" />
          </h6>
          <div className="header-button pr-3">
            <Link
              to={"/shipments/create"}
              className="btn btn-xs btn-secondary btn-rounded"
            >
              <FontAwesomeIcon icon="plus" style={{ marginRight: "8px" }} />
              {T.translate("shipments.list.add")}
            </Link>
          </div>
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
                <th className="text-center">Tracking ID</th>
                <th>Status</th>
                <th>Creator</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments &&
                filteredShipments.length > 0 &&
                filteredShipments.map(item => (
                  <tr key={item.trackingId}>
                    <td className="text-center">
                      <Link to={`/shipments/details/${item.id}`}>
                        {item.trackingId}
                      </Link>
                    </td>
                    <td>{!!item.status && item.status.name}</td>
                    <td>
                      {!!item.partner && (
                        <Link to={`/partners/details/${item.partner.id}`}>
                          {item.partner.name}
                        </Link>
                      )}
                      {!item.partner && (
                        <em className="font-weight-light text-muted">
                          Created Manually
                        </em>
                      )}
                    </td>
                  </tr>
                ))}
              {(!filteredShipments || filteredShipments.length === 0) && (
                <tr>
                  <td colSpan="3">
                    {T.translate("liveOperations.shipments.noResults")}
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

export default ShipmentsWidget;
