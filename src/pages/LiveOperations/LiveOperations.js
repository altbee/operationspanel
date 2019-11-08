import React, { Component } from "react";
import classNames from "classnames";
import { Button, ButtonGroup } from "reactstrap";
import { Redirect } from "react-router-dom";
import Fullscreen from "react-full-screen";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { AGENT_STATUS } from "common/constants/models/agent-status";
import { SUPPORT_EVENT_STATUS } from "common/constants/models/support-event-status";
import { SUPPORT_EVENT_TYPE } from "common/constants/models/support-event-type";
import API from "../../components/API/API";
import { MapWithMarkers } from "../../components/Maps/MapWithMarkers";
import AgentInfoWindow from "./AgentInfoWindow";
import CitySelectorWidget from "./CitySelectorWidget";
import JourneyGuruWidget from "./JourneyGuruWidget";
import AlertsAndEventsWidget from "./AlertsAndEventsWidget";
import ShipmentsWidget from "./ShipmentsWidget";
import StatisticsWidget from "./StatisticsWidget";
import { withHeader } from "../../components/HeaderProvider/HeaderProvider";
import CarVector from "./CarVector";

class LiveOperations extends Component {
  constructor(props) {
    super(props);

    this.API = new API();

    this.state = {
      agentMarkers: [],
      routeOffersRequiringAttention: null,
      supportEvents: null,
      redirectTo: "",
      isFullScreen: false,
      selectedWidget: null,
      widgetHasChanged: null,
      selectedMarker: null,
      mapCenter: {
        lat: 24.7135633,
        lng: 46.6751745
      },
      mapRef: null
    };

    this.fetchAgentsHandle = null;
    this.fetchAlertsHandle = null;

    this.selectTimeout = null;
    this.selectWidget = widget => {
      const { selectedWidget } = this.state;
      this.setState(
        {
          widgetHasChanged: selectedWidget === widget ? false : true
        },
        () => {
          clearTimeout(this.selectTimeout);
          this.selectTimeout = setTimeout(() => {
            this.setState({
              widgetHasChanged: false,
              selectedWidget: selectedWidget === widget ? null : widget
            });
          });
        }
      );
    };

    this.toggleFullScreen = () => {
      const { isFullScreen } = this.state;
      this.setState({ isFullScreen: !isFullScreen });
    };

    this.focusMarker = (event, agent) => {
      this.setState({
        selectedMarker: agent.id
      });
    };

    this.focusCityOnMap = city => {
      const { mapRef } = this.state;
      if (mapRef) {
        const center = new window.google.maps.LatLng(city.lat, city.lon);
        const circle = new window.google.maps.Circle({
          radius: city.radius,
          center
        });
        mapRef.current.fitBounds(circle.getBounds());
      }
    };

    this.fetchAgents = () => {
      const params = {
        filter: {
          where: {
            statusId: {
              inq: [AGENT_STATUS.AVAILABLE.id, AGENT_STATUS.ON_ROUTE.id]
            },
            currentGeoPoint: {
              neq: null
            }
          },
          include: ["status", "routes"]
        }
      };

      this.API.get("/agents", { showLoader: false, params })
        .then(response => {
          const { agentMarkers: previousMarkers } = this.state;
          const agentMarkers = response.data.map(agent => {
            const previousMarker = previousMarkers.filter(
              previousAgent => previousAgent.agentId === agent.id
            );
            let rotation = 0;
            if (previousMarker.length > 0) {
              const point1 = new window.google.maps.LatLng(
                previousMarker[0].position.lat,
                previousMarker[0].position.lng
              );
              const point2 = new window.google.maps.LatLng(
                agent.currentGeoPoint.lat,
                agent.currentGeoPoint.lng
              );
              rotation = window.google.maps.geometry.spherical.computeHeading(
                point1,
                point2
              );
              if (rotation === 0 && previousMarker.rotation !== 0) {
                rotation = previousMarker.rotation;
              }
            }
            const car = {
              url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                CarVector(rotation, agent.statusId)
              )}`,
              scaledSize: new window.google.maps.Size(32, 32)
            };
            const marker = {
              agentId: agent.id,
              position: agent.currentGeoPoint,
              icon: car,
              rotation,
              onClick: event => this.focusMarker(event, agent),
              infoWindowId: agent.id,
              infoWindow: <AgentInfoWindow agent={agent} />
            };
            return marker;
          });
          this.setState({ agentMarkers });
        })
        .catch(() => {});
    };

    this.fetchRouteOffersRequiringAttention = async () => {
      try {
        const {
          routeOffersRequiringAttention: routeOffersNotified
        } = this.state;
        const { data: routeOffersRequiringAttention } = await this.API.get(
          "/routes/route-offers-requiring-attention",
          { showLoader: false }
        );

        if (Array.isArray(routeOffersNotified)) {
          const routeOffersToNotify = routeOffersRequiringAttention.filter(
            offer => !routeOffersNotified.map(i => i.id).includes(offer.id)
          );

          routeOffersToNotify.map(offer => {
            return toast.warn(
              T.translate(
                "liveOperations.alertsAndEvents.notifications.routeOfferRequiringAttention",
                { id: offer.id }
              ),
              { position: toast.POSITION.BOTTOM_LEFT }
            );
          });
        }

        this.setState({
          routeOffersRequiringAttention
        });
      } catch (error) {
        this.setState({
          routeOffersRequiringAttention: []
        });
      }
    };

    this.fetchSupportEvents = async () => {
      try {
        const { supportEvents: supportEventsNotified } = this.state;
        const { data: supportEvents } = await this.API.get("/supportEvents", {
          params: {
            filter: {
              where: {
                statusId: {
                  inq: [
                    SUPPORT_EVENT_STATUS.CREATED.id,
                    SUPPORT_EVENT_STATUS.READ.id
                  ]
                }
              },
              include: [
                {
                  relation: "agent",
                  scope: {
                    fields: "name"
                  }
                },
                {
                  relation: "shipment",
                  scope: {
                    fields: "trackingId"
                  }
                },
                {
                  relation: "readUser",
                  scope: {
                    fields: "username"
                  }
                }
              ]
            }
          },
          showLoader: false
        });

        if (Array.isArray(supportEventsNotified)) {
          const supportEventsToNotify = supportEvents.filter(
            event => !supportEventsNotified.map(i => i.id).includes(event.id)
          );

          supportEventsToNotify.map(event => {
            const isCreatedStatus =
              event.statusId === SUPPORT_EVENT_STATUS.CREATED.id;
            const action = isCreatedStatus ? "error" : "info";
            const eventType = Object.keys(SUPPORT_EVENT_TYPE)
              .filter(type => SUPPORT_EVENT_TYPE[type].id === event.typeId)
              .map(type => SUPPORT_EVENT_TYPE[type])
              .pop();
            return toast[action](
              T.translate(
                `liveOperations.alertsAndEvents.notifications.supportEvent.${
                  isCreatedStatus ? "unread" : "unresolved"
                }`,
                {
                  agent: event.agent
                    ? event.agent.name
                    : T.translate(
                        "liveOperations.alertsAndEvents.unknownAgent"
                      ),
                  shipment: event.shipment
                    ? event.shipment.trackingId
                    : T.translate(
                        "liveOperations.alertsAndEvents.unknownShipment"
                      ),
                  type: T.translate(
                    `supportEvents.fields.types.${eventType.name}`
                  )
                }
              ),
              { position: toast.POSITION.BOTTOM_LEFT }
            );
          });
        }

        this.setState({
          supportEvents
        });
      } catch (error) {
        this.setState({
          supportEvents: []
        });
      }
    };

    this.fetchAlerts = () => {
      this.fetchRouteOffersRequiringAttention();
      this.fetchSupportEvents();
    };
  }

  componentDidMount() {
    const { header } = this.props;
    header.hideHeader();

    this.fetchAgents();
    this.fetchAlerts();
    this.fetchAgentsHandle = setInterval(this.fetchAgents, 10000);
    this.fetchAlertsHandle = setInterval(this.fetchAlerts, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.fetchAgentsHandle);
    clearInterval(this.fetchAlertsHandle);
    this.API.cancelAllRequests();
  }

  render() {
    const {
      isFullScreen: isFull,
      selectedWidget,
      selectedMarker,
      redirectTo,
      agentMarkers,
      routeOffersRequiringAttention,
      supportEvents,
      mapCenter,
      widgetHasChanged
    } = this.state;

    if (redirectTo) return <Redirect to={redirectTo} />;

    const alertCount =
      (routeOffersRequiringAttention && routeOffersRequiringAttention.length) +
      (supportEvents && supportEvents.length);

    return (
      <div className="operations-room-container">
        <Fullscreen
          enabled={isFull}
          onChange={isFullScreen => this.setState({ isFullScreen })}
        >
          <MapWithMarkers
            className="operations-map"
            markers={agentMarkers}
            activeInfoWindow={selectedMarker}
            autoCenter
            mapProps={{
              defaultCenter: mapCenter,
              defaultOptions: {
                zoom: 10,
                scrollwheel: false,
                zoomControl: true,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false
              }
            }}
            onRef={mapRef => this.setState({ mapRef })}
            containerHeight="100%"
          />

          <Button
            className="fullscreen-button box-shadow-z1"
            onClick={this.toggleFullScreen}
            color="primary"
            title={T.translate("liveOperations.fullScreen")}
          >
            <FontAwesomeIcon icon={isFull ? "compress" : "expand"} />
          </Button>

          <div className="operations-toolbar">
            <ButtonGroup className="box-shadow-z1 mr-2">
              <Button
                onClick={() => this.selectWidget("citySelector")}
                color="primary"
                active={selectedWidget === "citySelector"}
              >
                <FontAwesomeIcon icon="map-marker-alt" className="mr-2" />
                {T.translate("liveOperations.citySelector.title")}
              </Button>
            </ButtonGroup>
            <ButtonGroup className="box-shadow-z1">
              <Button
                onClick={() => this.selectWidget("journeyGuru")}
                color={selectedWidget === "journeyGuru" ? "secondary" : "light"}
              >
                <FontAwesomeIcon icon="user-tie" className="text-info mr-2" />
                {T.translate("liveOperations.journeyGuru.title")}
              </Button>
              <Button
                onClick={() => this.selectWidget("shipments")}
                color={selectedWidget === "shipments" ? "secondary" : "light"}
              >
                <FontAwesomeIcon
                  icon="shipping-fast"
                  className="text-success mr-2"
                />
                {T.translate("liveOperations.shipments.title")}
              </Button>
              <Button
                onClick={() => this.selectWidget("alertsAndEvents")}
                color={
                  selectedWidget === "alertsAndEvents" ? "secondary" : "light"
                }
              >
                <FontAwesomeIcon
                  icon="exclamation-triangle"
                  className="text-warning mr-2"
                />
                {T.translate("liveOperations.alertsAndEvents.title")}
                {alertCount > 0 && (
                  <strong className="label circle danger ml-1">
                    {alertCount}
                  </strong>
                )}
              </Button>
            </ButtonGroup>
          </div>

          <div
            className={classNames(
              "widgets-wrap",
              "animated",
              { fadeIn: selectedWidget },
              { fadeOut: widgetHasChanged || !selectedWidget }
            )}
          >
            {selectedWidget && selectedWidget !== "citySelector" && (
              <div className="active-widget box-shadow-z1 rounded">
                {selectedWidget === "journeyGuru" && (
                  <JourneyGuruWidget onRowClick={this.focusMarker} />
                )}
                {selectedWidget === "shipments" && <ShipmentsWidget />}
                {selectedWidget === "alertsAndEvents" && (
                  <AlertsAndEventsWidget
                    routeOffersRequiringAttention={
                      routeOffersRequiringAttention
                    }
                    supportEvents={supportEvents}
                  />
                )}
              </div>
            )}

            {selectedWidget === "citySelector" && (
              <div className="active-widget widget-auto-height box-shadow-z1 rounded">
                <CitySelectorWidget onCityChange={this.focusCityOnMap} />
              </div>
            )}
          </div>

          <StatisticsWidget />

          <ToastContainer className="toast-widget" autoClose={10000} />
        </Fullscreen>
      </div>
    );
  }
}

export default withHeader(LiveOperations);
