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

class PartnerDiscountList extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.pagination = React.createRef();

    this.searchFields = [
      { name: "Partner", field: "partnerId", type: "text" },
      { name: "Code", field: "code", type: "text" }
    ];

    this.sortFields = [
      { name: "partner", field: "partnerId" },
      { name: "code", field: "code" },
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
      resourceNameOnApi: "partnerDiscounts",
      listItems: [],
      backupList: [],
      sortBy: this.sortFields[0].name,
      order: "partnerId ASC",
      searchParam: {
        filter: {
          include: ["partner"]
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

    this.handleSearch = async (data, filter) => {
      let params = {};
      if (data) {
        const { field } = filter;
        switch (field) {
          case "partnerId": {
            const partnersRequest = await this.API.get("/partners", {
              params: {
                filter: {
                  fields: ["id"],
                  where: { name: { ilike: `%${data}%` } }
                }
              }
            });

            const partnerIds = partnersRequest.data.map(partner => partner.id);

            params = {
              filter: {
                where: {
                  [field]: {
                    inq: partnerIds
                  }
                }
              }
            };

            break;
          }

          default: {
            params = {
              filter: {
                where: {
                  [field]: {
                    ilike: `%${data}%`
                  }
                }
              }
            };
          }
        }
        params.filter.include = "partner";
      } else {
        params = {
          filter: {
            include: ["partner"]
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
      T.translate("partnerDiscounts.list.title"),
      T.translate("partnerDiscounts.list.description")
    );
    header.setActions([
      <Link
        to={{
          pathname: `/${resourceNameOnApi}/create`,
          state: {
            modal: true,
            modalTitle: T.translate("partnerDiscounts.form.title.create")
          }
        }}
        className="btn btn btn-secondary btn-rounded px-3"
      >
        <FontAwesomeIcon icon="plus" />{" "}
        {T.translate("partnerDiscounts.list.add")}
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
      <Container key="partner-discount-container" className="my-3">
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
                    onClick={() => this.handleSortChange("code")}
                    onKeyPress={() => this.handleSortChange("code")}
                  >
                    {T.translate("partnerDiscounts.fields.code")}
                    {this.getIcon("code")}
                  </span>
                </th>
                <th>
                  <span
                    className="table-header"
                    role="button"
                    tabIndex={-1}
                    onClick={() => this.handleSortChange("partner")}
                    onKeyPress={() => this.handleSortChange("partner")}
                  >
                    {T.translate("partnerDiscounts.fields.partner")}
                    {this.getIcon("partner")}
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
                  <td>{item.code}</td>
                  <td>
                    <Link
                      to={{
                        pathname: `/partners/details/${item.partnerId}`,
                        state: { from: "partnerDiscounts" }
                      }}
                    >
                      {item.partner
                        ? item.partner.name
                        : T.translate("defaults.notSet")}
                    </Link>
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
                            modalTitle: T.translate(
                              "partnerDiscounts.detail.title"
                            )
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        title={T.translate("partnerDiscounts.list.viewTooltip")}
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
                              "partnerDiscounts.form.title.update"
                            )
                          }
                        }}
                        title={T.translate("partnerDiscounts.list.editTooltip")}
                      >
                        <FontAwesomeIcon icon="pencil-alt" fixedWidth />
                      </Link>
                      {hasRoles(ROLE.ADMIN) && (
                        <Button
                          size="sm"
                          color="primary"
                          title={T.translate(
                            "partnerDiscounts.list.deleteTooltip"
                          )}
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
        title={T.translate("partnerDiscounts.list.deleteWarning.title", {
          itemToBeDeleted: selectedItemToBeDeleted
            ? selectedItemToBeDeleted.code
            : ""
        })}
        text={T.translate("partnerDiscounts.list.deleteWarning.message")}
        type="warning"
        showCancelButton
        confirmButtonText={T.translate(
          "partnerDiscounts.list.deleteWarning.confirmButton"
        )}
        cancelButtonText={T.translate(
          "partnerDiscounts.list.deleteWarning.cancelButton"
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

export default withHeader(PartnerDiscountList);
