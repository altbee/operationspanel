import { Link } from "react-router-dom";
import React, { Component } from "react";
import { Card, CardHeader, CardBody, Table } from "reactstrap";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SUPPORT_EVENT_STATUS } from "common/constants/models/support-event-status";
import { SUPPORT_EVENT_TYPE } from "common/constants/models/support-event-type";
import SimpleLabel from "../../components/SimpleLabel/SimpleLabel";

class AlertsAndEventsWidget extends Component {
  constructor(props) {
    super(props);

    this.renderSupportEvents = isRead => {
      const { supportEvents } = this.props;
      const filteredEvents = supportEvents.filter(
        event =>
          event.statusId ===
          (isRead
            ? SUPPORT_EVENT_STATUS.READ.id
            : SUPPORT_EVENT_STATUS.CREATED.id)
      );

      if (filteredEvents.length === 0) return null;

      return filteredEvents.map(event => {
        const eventType = Object.keys(SUPPORT_EVENT_TYPE)
          .filter(type => SUPPORT_EVENT_TYPE[type].id === event.typeId)
          .map(type => SUPPORT_EVENT_TYPE[type])
          .pop();
        return (
          <tr key={`event_${event.id}`}>
            <td className="align-middle">
              <SimpleLabel
                text={T.translate(
                  `liveOperations.alertsAndEvents.statuses.${
                    isRead ? "information" : "issue"
                  }`
                )}
                color={isRead ? "blue" : "red"}
              />
            </td>
            <td className="align-middle">
              {T.translate(
                `liveOperations.alertsAndEvents.notifications.supportEvent.${
                  isRead ? "unresolved" : "unread"
                }`,
                {
                  agent: event.agent ? (
                    <Link
                      to={{
                        pathname: `/agents/details/${event.agent.id}`,
                        state: {
                          modal: true,
                          modalTitle: T.translate("agents.detail.title")
                        }
                      }}
                    >
                      {event.agent.name}
                    </Link>
                  ) : (
                    T.translate("liveOperations.alertsAndEvents.unknownAgent")
                  ),
                  shipment: event.shipment ? (
                    <Link
                      to={{
                        pathname: `/shipments/details/${event.shipment.id}`,
                        state: {
                          modal: true,
                          modalTitle: T.translate("shipments.detail.title")
                        }
                      }}
                    >
                      {event.shipment.trackingId}
                    </Link>
                  ) : (
                    T.translate(
                      "liveOperations.alertsAndEvents.unknownShipment"
                    )
                  ),
                  type: (
                    <strong className="text-secondary d-block">
                      {T.translate(
                        eventType
                          ? `supportEvents.fields.types.${eventType.name}`
                          : "defaults.notSet"
                      )}
                    </strong>
                  )
                }
              )}
            </td>
            <td className="text-right py-0 align-middle">
              <Link
                to={{
                  pathname: `/supportEvents/details/${event.id}`,
                  state: {
                    modal: true,
                    modalTitle: T.translate("supportEvents.detail.title")
                  }
                }}
                className="btn btn-primary btn-sm"
                title={T.translate("supportEvents.list.viewTooltip")}
              >
                <FontAwesomeIcon icon="eye" fixedWidth />
              </Link>
            </td>
          </tr>
        );
      });
    };

    this.renderRouteOffersRequiringAttention = () => {
      const { routeOffersRequiringAttention } = this.props;
      if (routeOffersRequiringAttention.length === 0) return null;
      return routeOffersRequiringAttention.map(route => (
        <tr key={`route_${route.id}`}>
          <td className="align-middle">
            <SimpleLabel
              text={T.translate(
                "liveOperations.alertsAndEvents.statuses.warning"
              )}
              color="yellow"
            />
          </td>
          <td className="align-middle">
            {T.translate(
              "liveOperations.alertsAndEvents.listItems.routeOfferRequiringAttention",
              {
                routeOffer: (
                  <Link
                    to={{
                      pathname: `/routes/details/${route.id}`,
                      state: {
                        modal: true,
                        modalTitle: T.translate("routes.detail.title")
                      }
                    }}
                  >
                    {T.translate("liveOperations.alertsAndEvents.routeOffer", {
                      id: route.id
                    })}
                  </Link>
                )
              }
            )}
          </td>
          <td className="text-right py-0 align-middle">
            <Link
              to={{
                pathname: `/routes/details/${route.id}`,
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
          </td>
        </tr>
      ));
    };
  }

  render() {
    const unreadSupportEvents = this.renderSupportEvents(false);
    const unresolvedSupportEvents = this.renderSupportEvents(true);
    const routeOffersRequiringAttention = this.renderRouteOffersRequiringAttention();
    const isEmptyResult =
      unreadSupportEvents === null &&
      unresolvedSupportEvents === null &&
      routeOffersRequiringAttention === null;

    return (
      <Card className="h-100">
        <CardHeader className="p-2">
          <h6 className="font-weight-light mb-0">
            <FontAwesomeIcon
              icon="exclamation-triangle"
              className="text-warning mr-2"
            />
            {T.translate("liveOperations.alertsAndEvents.title")}
          </h6>
        </CardHeader>
        <CardBody className="table-widget">
          <Table responsive striped hover size="sm">
            <thead>
              <tr>
                <th>Type</th>
                <th colSpan="2">Event</th>
              </tr>
            </thead>
            {isEmptyResult ? (
              <tbody>
                <tr>
                  <td colSpan="3">
                    {T.translate("liveOperations.alertsAndEvents.noResults")}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {unreadSupportEvents}
                {routeOffersRequiringAttention}
                {unresolvedSupportEvents}
              </tbody>
            )}
          </Table>
        </CardBody>
      </Card>
    );
  }
}

export default AlertsAndEventsWidget;
