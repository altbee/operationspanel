import React, { Component } from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";
import { Link } from "react-router-dom";
import SweetAlert from "sweetalert2-react";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ROLE } from "common/constants/models/role";
import { hasRoles } from "../../components/Auth/AuthProvider";
import { Pagination } from "../../components/Pagination/Pagination";
import API from "../../components/API/API";
import SearchBy from "../../components/Search/SearchBy";
import {
  InlineForm,
  InlineFormConsumer
} from "../../components/InlineEdit/InlineForm";
import InlineField from "../../components/InlineEdit/InlineField";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class FleetOwnerList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.searchFields = [
      { name: "Name", field: "name", type: "text" },
      { name: "City", field: "city", type: "text" },
      { name: "Country", field: "country", type: "text" }
    ];

    this.sortFields = [
      { name: "name", field: "name" },
      { name: "city", field: "city" },
      { name: "country", field: "country" },
      { name: "createdAt", field: "createdAt" }
    ];

    this.getIcon = name => {
      const { sortBy } = this.state;
      const { field } = this.sortFields.find(d => d.name === name);
      const icon = field === sortBy.field ? sortBy.icon : "sort";
      return <FontAwesomeIcon className="sort-icon" icon={icon} />;
    };

    this.state = {
      resourceNameOnApi: "fleetOwners",
      listItems: [],
      backupList: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "name ASC",
      searchParam: {
        filter: {}
      }
    };

    this.delete = id => {
      const { resourceNameOnApi } = this.state;
      this.API.delete(`/${resourceNameOnApi}/${id}`).then(() => {
        this.pagination.current.fetchItems();
      });
    };

    this.handleSortChange = name => {
      const { sortBy } = this.state;
      const { type, field: previousField } = sortBy;
      const { field } = this.sortFields.find(d => d.name === name);
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

    this.handleSearch = (data, filter) => {
      let params;
      if (data) {
        const { field } = filter;
        params = {
          filter: {
            where: {
              [field]: {
                ilike: `%${data}%`
              }
            }
          }
        };
      } else {
        params = {
          filter: {
            where: {}
          }
        };
      }
      this.setState({ searchParam: params }, () => {
        this.pagination.current.fetchItemCount();
      });
    };

    this.saveResource = async data => {
      const { resourceNameOnApi } = this.state;
      await this.API.put(`/${resourceNameOnApi}`, data);
      this.pagination.current.fetchItemCount();
    };
  }

  componentDidMount() {
    const { resourceNameOnApi } = this.state;
    const { header } = this.props;
    header.setTitle(
      T.translate("fleetOwners.list.title"),
      T.translate("fleetOwners.list.description")
    );
    header.setActions([
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalSize: "md",
            modalTitle: T.translate("fleetOwners.form.title.create")
          }
        }}
        className="btn btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" /> {T.translate("fleetOwners.list.add")}
      </Link>
    ]);
  }

  render() {
    const {
      resourceNameOnApi,
      listItems,
      showDeletionConfirmation,
      selectedItemToBeDeleted,
      searchParam,
      order
    } = this.state;

    return [
      <Container key="fleet-owner-list-container" className="pt-3">
        <div className="box">
          <Container className="py-3">
            <Row className="justify-content-center">
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
                    onClick={() => this.handleSortChange("name")}
                    onKeyPress={() => this.handleSortChange("name")}
                  >
                    {T.translate("fleetOwners.fields.name")}
                    {this.getIcon("name")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("city")}
                    onKeyPress={() => this.handleSortChange("city")}
                  >
                    {T.translate("fleetOwners.fields.city")}
                    {this.getIcon("city")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("country")}
                    onKeyPress={() => this.handleSortChange("country")}
                  >
                    {T.translate("fleetOwners.fields.country")}
                    {this.getIcon("country")}
                  </span>
                </th>
                <th colSpan={2}>
                  <span
                    className="table-header"
                    onClick={() => this.handleSortChange("createdAt")}
                    onKeyPress={() => this.handleSortChange("createdAt")}
                    role="button"
                    tabIndex={-1}
                  >
                    {T.translate("agents.fields.createdAt")}
                    {this.getIcon("createdAt")}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {listItems.map(item => (
                <InlineForm resource={item} key={item.id}>
                  <tr>
                    <td>
                      <InlineField
                        property="name"
                        placeholder={T.translate("fleetOwners.fields.name")}
                      />
                    </td>
                    <td>
                      <InlineField
                        property="city"
                        placeholder={T.translate("fleetOwners.fields.city")}
                      />
                    </td>
                    <td>
                      <InlineField
                        property="country"
                        placeholder={T.translate("fleetOwners.fields.country")}
                      />
                    </td>
                    <td className="align-middle">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "--"}
                    </td>
                    <td className="text-right py-0 align-middle">
                      <InlineFormConsumer
                        children={inlineForm => {
                          if (inlineForm.isEditing) {
                            return (
                              <div className="btn-group" role="group">
                                <Button
                                  size="sm"
                                  color="primary"
                                  onClick={() => {
                                    this.saveResource(inlineForm.resource);
                                    inlineForm.toggleEditing();
                                  }}
                                >
                                  {T.translate("defaults.save")}
                                </Button>
                                <Button
                                  size="sm"
                                  color="secondary"
                                  onClick={inlineForm.toggleEditing}
                                >
                                  {T.translate("defaults.cancel")}
                                </Button>
                              </div>
                            );
                          }
                          return (
                            <div className="btn-group" role="group">
                              <Link
                                to={{
                                  pathname: `/${resourceNameOnApi}/details/${
                                    item.id
                                  }`,
                                  state: {
                                    modal: true,
                                    modalTitle: T.translate(
                                      "fleetOwners.detail.title"
                                    )
                                  }
                                }}
                                className="btn btn-primary btn-sm"
                                title={T.translate(
                                  "fleetOwners.list.viewTooltip"
                                )}
                              >
                                <FontAwesomeIcon icon="eye" fixedWidth />
                              </Link>
                              <Button
                                size="sm"
                                color="primary"
                                title={T.translate(
                                  "agentTags.list.editTooltip"
                                )}
                                onClick={inlineForm.toggleEditing}
                              >
                                <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                              </Button>
                              {hasRoles(ROLE.ADMIN) && (
                                <Button
                                  size="sm"
                                  color="primary"
                                  title={T.translate(
                                    "fleetOwners.list.deleteTooltip"
                                  )}
                                  onClick={() => {
                                    this.setState({
                                      selectedItemToBeDeleted: item,
                                      showDeletionConfirmation: true
                                    });
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon="trash-alt"
                                    fixedWidth
                                  />
                                </Button>
                              )}
                            </div>
                          );
                        }}
                      />
                    </td>
                  </tr>
                </InlineForm>
              ))}
            </tbody>
          </Table>
          <footer className="p-a dker">
            <Pagination
              ref={this.pagination}
              resourceNameOnApi={resourceNameOnApi}
              filter={{ ...searchParam.filter, order }}
              onItemsReceived={listItemsReceived => {
                this.setState({
                  listItems: listItemsReceived,
                  backupList: listItemsReceived
                });
              }}
            />
          </footer>
        </div>
      </Container>,
      <SweetAlert
        key="sweet-alert"
        show={showDeletionConfirmation}
        title={T.translate("fleetOwners.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.name
            : ""
        })}
        text={T.translate("fleetOwners.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "fleetOwners.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "fleetOwners.list.deleteWarning.cancelButton"
        )}
        confirmButtonClass="btn btn-primary btn-rounded mx-2 btn-lg px-5"
        cancelButtonClass="btn btn-secondary btn-rounded mx-2 btn-lg px-5"
        buttonsStyling={false}
        onConfirm={() => {
          this.delete(selectedItemToBeDeleted.id);
          this.setState({ showDeletionConfirmation: false });
        }}
      />
    ];
  }
}

export default withHeader(FleetOwnerList);
