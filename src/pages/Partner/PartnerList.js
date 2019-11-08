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
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";

class PartnerList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.searchFields = [
      { name: "Name", field: "name", type: "text" },
      { name: "Phone", field: "phone", type: "text" }
    ];

    this.sortFields = [
      { name: "name", field: "name" },
      { name: "phone", field: "phone" },
      { name: "type", field: "typeId" },
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
      resourceNameOnApi: "partners",
      listItems: [],
      backupList: [],
      sortBy: {
        field: "",
        type: "",
        icon: ""
      },
      order: "name ASC",
      searchParam: {
        filter: {
          include: ["type"]
        }
      }
    };

    this.delete = id => {
      const { resourceNameOnApi } = this.state;
      this.API.delete(`/${resourceNameOnApi}/${id}`).then(() => {
        this.pagination.current.fetchItems();
      });
    };

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
  }

  componentDidMount() {
    const { resourceNameOnApi } = this.state;
    const { header } = this.props;
    header.setTitle(
      T.translate("partners.list.title"),
      T.translate("partners.list.description")
    );
    header.setActions([
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalTitle: T.translate("partners.form.title.create")
          }
        }}
        className="btn btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" /> {T.translate("partners.list.add")}
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
      <Container key="partner-list-container" className="pt-3">
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
                    {T.translate("partners.fields.name")}
                    {this.getIcon("name")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("phone")}
                    onKeyPress={() => this.handleSortChange("phone")}
                  >
                    {T.translate("partners.fields.phone")}
                    {this.getIcon("phone")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("type")}
                    onKeyPress={() => this.handleSortChange("type")}
                  >
                    {T.translate("partners.fields.type")}
                    {this.getIcon("type")}
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
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.phone}</td>
                  <td>{item.type ? item.type.name : "--"}</td>
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
                            from: "partners",
                            modal: true,
                            modalTitle: T.translate("partners.detail.title")
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate("partners.list.viewTooltip")}
                      >
                        <FontAwesomeIcon icon="eye" fixedWidth />
                      </Link>
                      <Link
                        className="btn btn-primary btn-sm"
                        to={{
                          pathname: `/${resourceNameOnApi}/update/${item.id}`,
                          state: {
                            modal: true,
                            modalTitle: T.translate(
                              "partners.form.title.update"
                            )
                          }
                        }}
                        title={T.translate("partners.list.editTooltip")}
                      >
                        <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate("partners.list.deleteTooltip")}
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
              onItemsReceived={receivedListItems => {
                this.setState({
                  listItems: receivedListItems,
                  backupList: receivedListItems
                });
              }}
            />
          </footer>
        </div>
      </Container>,
      <SweetAlert
        key="sweet-alert"
        show={showDeletionConfirmation}
        title={T.translate("partners.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.name
            : ""
        })}
        text={T.translate("partners.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "partners.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "partners.list.deleteWarning.cancelButton"
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

export default withHeader(PartnerList);
