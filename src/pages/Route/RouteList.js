import React, { Component } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { Link } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Dropdown from "../../components/Dropdown/Dropdown";
import { ROUTE_BUNDLE } from "common/constants/models/route-bundle";
import { ROUTE_STATUS } from "common/constants/models/route-status";
import { ROLE } from "common/constants/models/role";
import { hasRoles } from "../../components/Auth/AuthProvider";
import { Pagination } from "../../components/Pagination/Pagination";
import API from "../../components/API/API";
import SearchBy from "../../components/Search/SearchBy";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class RouteList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.bundleOptions = ["All"].concat(
      Object.keys(ROUTE_BUNDLE).map(type => ROUTE_BUNDLE[type].name)
    );

    this.statusOptions = ["All"].concat(
      Object.keys(ROUTE_STATUS).map(type => ROUTE_STATUS[type].name)
    );

    this.searchFields = [{ name: "Agent", field: "agentId", type: "text" }];

    this.sortFields = [
      { name: "agent", field: "agentId" },
      { name: "bundle", field: "bundleId" },
      { name: "status", field: "statusId" },
      { name: "value", field: "value" },
      { name: "createdAt", field: "createdAt" }
    ];

    this.getIcon = name => {
      const { sortBy } = this.state;

      const element = this.sortFields.find(d => d.name === name);
      if (!element) {
        return "";
      }

      const { field } = this.sortFields.find(d => d.name === name);
      const icon = field === sortBy.field ? sortBy.icon : "sort";
      return <FontAwesomeIcon className="sort-icon" icon={icon} />;
    };

    this.state = {
      resourceNameOnApi: "routes",
      listItems: [],
      autoAssignResponse: null,
      autoAssignError: null,
      showAutoAssignSuccessAlert: false,
      showAutoAssignErrorAlert: false,
      backupList: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "agentId ASC",
      searchParam: {
        filter: {
          include: ["agent", "bundle", "status"]
        }
      },
      routeGenerationResponse: null,
      bundleOption: this.bundleOptions[0],
      statusOption: this.statusOptions[0]
    };

    this.routeStatusesEndpoint = "routeStatuses";
    this.routeBundlesEndpoint = "routeBundles";

    this.handleSortChange = name => {
      const element = this.sortFields.find(d => d.name === name);
      if (!element) {
        return;
      }

      const { sortBy } = this.state;
      const { type, field: previousField } = sortBy;
      const { field } = element;

      let newType = "DESC";

      if (field === previousField) {
        newType = type === "ASC" ? "DESC" : "ASC";
      }

      this.setState(
        {
          sortBy: {
            field,
            type: newType,
            icon: newType === "ASC" ? "sort-up" : "sort-down"
          },
          order: `${field} ${newType}`
        },
        () => {
          this.pagination.current.fetchItemCount();
        }
      );
    };

    this.getFilterId = (model, value) => {
      const key = Object.keys(model).filter(
        item => model[item].name === value
      )[0];
      return model[key].id;
    };

    this.handleFilterChange = (key, value) => {
      this.setState({ [key]: value }, () => {
        const { searchKeyword, selectedFilter } = this.state;
        this.handleSearch(searchKeyword, selectedFilter);
      });
    };

    this.handleSearch = async (data, filter) => {
      const { statusOption, bundleOption } = this.state;
      let params;
      if (data) {
        const { field } = filter;
        switch (field) {
          case "bundleId":
          case "statusId":
          case "agentId": {
            let endpoint;

            if (field === "statusId") {
              endpoint = `/${this.routeStatusesEndpoint}`;
            } else if (field === "bundleId") {
              endpoint = `/${this.routeBundlesEndpoint}`;
            } else if (field === "agentId") {
              endpoint = "/agents";
            }

            const response = await this.API.get(endpoint, {
              params: {
                filter: {
                  fields: ["id"],
                  where: { name: { ilike: `%${data}%` } }
                }
              }
            });

            const ids = response.data.map(agent => agent.id);

            params = {
              filter: {
                where: {
                  [field]: {
                    inq: ids
                  }
                }
              }
            };
            break;
          }
          default:
            break;
        }
        params.filter.include = ["agent"];
      } else {
        params = {
          filter: {
            where: {},
            include: ["agent"]
          }
        };
      }
      if (statusOption !== this.statusOptions[0]) {
        const statusId = this.getFilterId(ROUTE_STATUS, statusOption);
        params.filter.where.statusId = statusId;
      }
      if (bundleOption !== this.bundleOptions[0]) {
        const bundleId = this.getFilterId(ROUTE_BUNDLE, bundleOption);
        params.filter.where.bundleId = bundleId;
      }
      this.setState({ searchParam: params }, () => {
        this.pagination.current.fetchItemCount();
      });
    };

    /**
     * @param {number[]} [specificRouteIds]
     */
    this.updateListFilter = specificRouteIds => {
      const filter = {
        include: [
          {
            relation: "agent",
            scope: {
              fields: ["name"]
            }
          }
        ]
      };

      if (specificRouteIds) {
        filter.where = { id: { inq: specificRouteIds } };
      }
      this.setState({ searchParam: { filter } });
    };

    this.delete = id => {
      const { resourceNameOnApi } = this.state;
      this.API.delete(`/${resourceNameOnApi}/${id}`).then(() => {
        this.updateListFilter();
        this.pagination.current.fetchItems();
      });
    };

    this.onClickAutoAssignButton = () => {
      const { resourceNameOnApi } = this.state;
      this.API.get(`/${resourceNameOnApi}/auto-assign`)
        .then(response => {
          this.setState({
            autoAssignResponse: response.data,
            showAutoAssignSuccessAlert: true
          });

          const specificRouteIds = response.data.map(route => route.id);
          this.updateListFilter(specificRouteIds);
          this.pagination.current.fetchItems();
        })
        .catch(error => {
          this.setState({
            autoAssignError: error.response
              ? error.response.data
              : error.message,
            showAutoAssignErrorAlert: true
          });
        });
    };

    this.onClickGenerateRoutesButton = async () => {
      const { resourceNameOnApi } = this.state;
      const response = await this.API.get(`/${resourceNameOnApi}/generate`);
      this.setState({
        routeGenerationResponse: response.data,
        showRouteGenerationSuccessAlert: true
      });
      const specificRouteIds = response.data.map(route => route.id);
      this.updateListFilter(specificRouteIds);
      this.pagination.current.fetchItems();
    };
  }

  componentDidMount() {
    const { resourceNameOnApi } = this.state;
    const { header } = this.props;
    header.setTitle(
      T.translate("routes.list.title"),
      T.translate("routes.list.description")
    );
    header.setActions([
      <Button
        color="secondary"
        outline
        onClick={this.onClickGenerateRoutesButton}
        className="btn-rounded px-3"
      >
        <FontAwesomeIcon icon="atom" />{" "}
        {T.translate("routes.list.generateRoutes")}
      </Button>,
      <Button
        color="secondary"
        outline
        onClick={this.onClickAutoAssignButton}
        className="btn-rounded px-3"
      >
        <FontAwesomeIcon icon="magic" /> {T.translate("routes.list.autoAssign")}
      </Button>,
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalSize: "md",
            modalTitle: T.translate("routes.form.title.create")
          }
        }}
        className="btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" /> {T.translate("routes.list.add")}
      </Link>
    ]);

    this.updateListFilter();

    this.refreshTimer = setInterval(() => {
      this.pagination.current.fetchItemCount();
    }, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
  }

  render() {
    const {
      resourceNameOnApi,
      listItems,
      showDeletionConfirmation,
      selectedItemToBeDeleted,
      showAutoAssignSuccessAlert,
      showAutoAssignErrorAlert,
      autoAssignError,
      autoAssignResponse,
      searchParam,
      order,
      showRouteGenerationSuccessAlert,
      routeGenerationResponse
    } = this.state;

    return [
      <Container key="route-list-container" className="pt-3">
        <div className="box">
          <Container className="py-3">
            <Row className="justify-content-center">
              <Col md={3} sm={6}>
                <Dropdown
                  title={T.translate("routes.fields.bundle")}
                  list={this.bundleOptions}
                  handleChange={value =>
                    this.handleFilterChange("bundleOption", value)
                  }
                />
              </Col>
              <Col md={3} sm={6}>
                <Dropdown
                  title={T.translate("routes.fields.status")}
                  list={this.statusOptions}
                  handleChange={value =>
                    this.handleFilterChange("statusOption", value)
                  }
                />
              </Col>
              <Col md={6}>
                <SearchBy
                  filters={this.searchFields}
                  onSearch={this.handleSearch}
                />
              </Col>
            </Row>
          </Container>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("agent")}
                    onKeyPress={() => this.handleSortChange("agent")}
                  >
                    {T.translate("routes.fields.agent")}
                    {this.getIcon("agent")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("bundle")}
                    onKeyPress={() => this.handleSortChange("bundle")}
                  >
                    {T.translate("routes.fields.bundle")}
                    {this.getIcon("bundle")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("status")}
                    onKeyPress={() => this.handleSortChange("status")}
                  >
                    {T.translate("routes.fields.status")}
                    {this.getIcon("status")}
                  </span>
                </th>
                <th className="text-center">
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("value")}
                    onKeyPress={() => this.handleSortChange("value")}
                  >
                    {T.translate("routes.fields.value")}
                    {this.getIcon("value")}
                  </span>
                </th>
                <th className="text-center">
                  <FontAwesomeIcon icon="cubes" title="Total Shipments" />
                </th>
                <th className="text-center">
                  <FontAwesomeIcon
                    icon="clipboard-list"
                    title="Visibility on Route Offers page"
                  />
                </th>
                <th colSpan={2}>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("createdAt")}
                    onKeyPress={() => this.handleSortChange("createdAt")}
                  >
                    {T.translate("routes.fields.createdAt")}
                    {this.getIcon("createdAt")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {listItems.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.agent ? (
                      <Link
                        to={{
                          pathname: `/agents/details/${item.agentId}`,
                          state: { from: "routes" }
                        }}
                      >
                        {item.agent.name}
                      </Link>
                    ) : (
                      T.translate("defaults.notSet")
                    )}
                  </td>
                  <td>{item.bundle}</td>
                  <td>{item.status}</td>
                  <td className="text-center">
                    {item.value || T.translate("defaults.notSet")}
                  </td>
                  <td className="text-center">
                    {item.totalShipments}
                    {item.totalIgnoredShipments > 0 && (
                      <span
                        className="text-muted"
                        title={T.translate(
                          "routes.list.ignoredShipmentsTooltip",
                          {
                            count: item.totalIgnoredShipments
                          }
                        )}
                      >
                        {` (${item.totalIgnoredShipments})`}
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <FontAwesomeIcon
                      icon={item.isOffered ? "eye" : "eye-slash"}
                      title={`${
                        item.isOffered ? "Displayed on" : "Hidden from"
                      } Route Offers page on Agent App`}
                    />
                  </td>
                  <td className="align-middle">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "--"}
                  </td>
                  <td className="text-right py-0 align-middle">
                    <div className="btn-group" role="group">
                      <Link
                        to={{
                          pathname: `/${resourceNameOnApi}/details/${item.id}`,
                          state: {
                            modal: true,
                            modalTitle: T.translate("routes.detail.title")
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate("routes.list.viewTooltip")}
                      >
                        <FontAwesomeIcon icon="eye" fixedWidth />
                      </Link>
                      <Link
                        className="btn btn-primary btn-sm"
                        to={{
                          pathname: `/${resourceNameOnApi}/update/${item.id}`,
                          state: {
                            modal: true,
                            modalSize: "md",
                            modalTitle: T.translate("routes.form.title.update")
                          }
                        }}
                        title={T.translate("routes.list.editTooltip")}
                      >
                        <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate("routes.list.deleteTooltip")}
                          onClick={() => {
                            this.setState({
                              selectedItemToBeDeleted: item,
                              showDeletionConfirmation: true
                            });
                          }}
                        >
                          <FontAwesomeIcon icon="trash-alt" fixedWidth />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <footer className="p-a dker">
            <Pagination
              ref={this.pagination}
              resourceNameOnApi={resourceNameOnApi}
              filter={{ ...searchParam.filter, order }}
              onItemsReceived={async listItemsReceived => {
                const routeStatuses = await this.API.get(
                  `/${this.routeStatusesEndpoint}`
                );
                const routeBundles = await this.API.get(
                  `/${this.routeBundlesEndpoint}`
                );

                const newList = listItemsReceived.map(d => {
                  const element = { ...d };

                  if (routeStatuses.data) {
                    const statusFound = routeStatuses.data.find(
                      r => r.id === d.statusId
                    );
                    if (statusFound) element.status = statusFound.name;
                  }

                  if (routeBundles.data) {
                    const routeBundleFound = routeBundles.data.find(
                      r => r.id === d.bundleId
                    );
                    if (routeBundleFound)
                      element.bundle = routeBundleFound.name;
                  }

                  return element;
                });

                this.setState({
                  listItems: newList,
                  backupList: newList
                });
              }}
            />
          </footer>
        </div>
      </Container>,
      <SweetAlert
        key="sweet-alert-deletion-confirmation"
        show={showDeletionConfirmation}
        title={T.translate("routes.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.name
            : ""
        })}
        text={T.translate("routes.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "routes.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate("routes.list.deleteWarning.cancelButton")}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        cancelButtonClass="btn btn-secondary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.delete(selectedItemToBeDeleted.id);
          this.setState({ showDeletionConfirmation: false });
        }}
      />,
      <SweetAlert
        key="sweet-alert-auto-assign-success"
        show={showAutoAssignSuccessAlert}
        title={T.translate("routes.list.autoAssignSuccessAlert.title")}
        text={T.translate("routes.list.autoAssignSuccessAlert.text", {
          numberOfRoutesAssigned: autoAssignResponse
            ? autoAssignResponse.length
            : 0
        })}
        type="success"
        confirmButtonText={T.translate(
          "routes.list.autoAssignSuccessAlert.confirmButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.setState({ showAutoAssignSuccessAlert: false });
        }}
      />,
      <SweetAlert
        key="sweet-alert-auto-assign-error"
        show={showAutoAssignErrorAlert}
        title={T.translate("routes.list.autoAssignErrorAlert.title")}
        text={JSON.stringify(autoAssignError)}
        type="warning"
        confirmButtonText={T.translate(
          "routes.list.autoAssignErrorAlert.confirmButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.setState({ showAutoAssignErrorAlert: false });
        }}
      />,
      <SweetAlert
        key="sweet-alert-route-generation-success"
        show={showRouteGenerationSuccessAlert}
        title={T.translate("routes.list.routeGenerationSuccessAlert.title")}
        text={T.translate("routes.list.routeGenerationSuccessAlert.text", {
          numberOfRoutesGenerated: routeGenerationResponse
            ? routeGenerationResponse.length
            : 0
        })}
        type="success"
        confirmButtonText={T.translate("defaults.ok")}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.setState({ showRouteGenerationSuccessAlert: false });
        }}
      />
    ];
  }
}

export default withHeader(RouteList);
