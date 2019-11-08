import { ROLE } from "common/constants/models/role";
import LiveOperations from "../pages/LiveOperations/LiveOperations";
import AreaList from "../pages/Area/AreaList";
import AgentList from "../pages/Agent/AgentList";
import AreaDetails from "../pages/Area/AreaDetails";
import AreaForm from "../pages/Area/AreaForm";
import AgentTagList from "../pages/AgentTag/AgentTagList";
import AgentTagForm from "../pages/AgentTag/AgentTagForm";
import AgentTagDetails from "../pages/AgentTag/AgentTagDetails";
import RouteList from "../pages/Route/RouteList";
import RouteDetails from "../pages/Route/RouteDetails";
import RouteForm from "../pages/Route/RouteForm";
import ShipmentList from "../pages/Shipment/ShipmentList";
import ShipmentDetails from "../pages/Shipment/ShipmentDetails";
import ShipmentForm from "../pages/Shipment/ShipmentForm";
import ShipmentBulkUpload from "../pages/Shipment/ShipmentBulkUpload";
import AgentDetails from "../pages/Agent/AgentDetails";
import AgentForm from "../pages/Agent/AgentForm";
import PartnerList from "../pages/Partner/PartnerList";
import PartnerDetails from "../pages/Partner/PartnerDetails";
import PartnerForm from "../pages/Partner/PartnerForm";
import PartnerDiscountList from "../pages/PartnerDiscount/PartnerDiscountList";
import PartnerDiscountDetails from "../pages/PartnerDiscount/PartnerDiscountDetails";
import PartnerDiscountForm from "../pages/PartnerDiscount/PartnerDiscountForm";
import PartnerCashInstanceList from "../pages/PartnerCashInstance/PartnerCashInstanceList";
import PartnerCashInstanceDetails from "../pages/PartnerCashInstance/PartnerCashInstanceDetails";
import PartnerCashInstanceForm from "../pages/PartnerCashInstance/PartnerCashInstanceForm";
import AgentCashInstanceList from "../pages/AgentCashInstance/AgentCashInstanceList";
import AgentCashInstanceDetails from "../pages/AgentCashInstance/AgentCashInstanceDetails";
import AgentCashInstanceForm from "../pages/AgentCashInstance/AgentCashInstanceForm";
import UserList from "../pages/User/UserList";
import UserDetails from "../pages/User/UserDetails";
import UserForm from "../pages/User/UserForm";
import FleetOwnerList from "../pages/FleetOwner/FleetOwnerList";
import FleetOwnerDetails from "../pages/FleetOwner/FleetOwnerDetails";
import FleetOwnerForm from "../pages/FleetOwner/FleetOwnerForm";
import SettingsForm from "../pages/Settings/SettingsForm";
import ReportsForm from "../pages/Reports/ReportsForm";
import SupportEventList from "../pages/SupportEvent/SupportEventList";
import SupportEventDetails from "../pages/SupportEvent/SupportEventDetails";
import RouteExceptionList from "../pages/RouteException/RouteExceptionList";
import RouteExceptionDetails from "../pages/RouteException/RouteExceptionDetails";
import RouteExceptionForm from "../pages/RouteException/RouteExceptionForm";

/**
 * Define routes and sidebar links at the same time.
 * Note that only items with 'icon' property and
 * without 'redirect' property will be rendered on sidebar.
 * @type {Object[]}
 */
const operationsTeamRoutes = [
  {
    path: "/liveOperations",
    name: "menu.liveOperations",
    icon: "th-large",
    component: LiveOperations,
    authRequired: true
  },
  {
    path: "/supportEvents/list",
    name: "menu.supportEvents.list",
    icon: "headset",
    component: SupportEventList,
    authRequired: true
  },
  {
    path: "/supportEvents/details/:id",
    name: "menu.supportEvents.details",
    component: SupportEventDetails,
    authRequired: true
  },
  {
    path: "/users/list",
    name: "menu.users.list",
    icon: "users",
    component: UserList,
    authRequired: true,
    roles: [ROLE.ADMIN]
  },
  {
    path: "/users/details/:id",
    name: "menu.users.details",
    component: UserDetails,
    authRequired: true,
    roles: [ROLE.ADMIN]
  },
  {
    path: "/users/update/:id",
    name: "menu.users.update",
    component: UserForm,
    authRequired: true,
    roles: [ROLE.ADMIN]
  },
  {
    path: "/users/create",
    name: "menu.users.create",
    component: UserForm,
    authRequired: true,
    roles: [ROLE.ADMIN]
  },
  {
    path: "/agents/list",
    name: "menu.agents.list",
    icon: "user-friends",
    component: AgentList,
    authRequired: true
  },
  {
    path: "/agents/details/:id",
    name: "menu.agents.details",
    component: AgentDetails,
    authRequired: true
  },
  {
    path: "/agents/update/:id",
    name: "menu.agents.update",
    component: AgentForm,
    authRequired: true
  },
  {
    path: "/agents/create",
    name: "menu.agents.create",
    component: AgentForm,
    authRequired: true
  },
  {
    path: "/agentTags/list",
    name: "menu.agentTags.list",
    icon: "tag",
    component: AgentTagList,
    authRequired: true
  },
  {
    path: "/agentTags/details/:id",
    name: "menu.agentTags.details",
    component: AgentTagDetails,
    authRequired: true
  },
  {
    path: "/agentTags/update/:id",
    name: "menu.agentTags.update",
    component: AgentTagForm,
    authRequired: true
  },
  {
    path: "/agentTags/create",
    name: "menu.agentTags.create",
    component: AgentTagForm,
    authRequired: true
  },
  {
    path: "/agentCashInstances/list",
    name: "menu.agentCashInstances.list",
    icon: "credit-card",
    component: AgentCashInstanceList,
    authRequired: true
  },
  {
    path: "/agentCashInstances/details/:id",
    name: "menu.agentCashInstances.details",
    component: AgentCashInstanceDetails,
    authRequired: true
  },
  {
    path: "/agentCashInstances/update/:id",
    name: "menu.agentCashInstances.update",
    component: AgentCashInstanceForm,
    authRequired: true
  },
  {
    path: "/agentCashInstances/create",
    name: "menu.agentCashInstances.create",
    component: AgentCashInstanceForm,
    authRequired: true
  },
  {
    path: "/shipments/list",
    name: "menu.shipments.list",
    icon: "shipping-fast",
    component: ShipmentList,
    authRequired: true
  },
  {
    path: "/shipments/details/:id",
    name: "menu.shipments.details",
    component: ShipmentDetails,
    authRequired: true
  },
  {
    path: "/shipments/update/:id",
    name: "menu.shipments.update",
    component: ShipmentForm,
    authRequired: true
  },
  {
    path: "/shipments/create",
    name: "menu.shipments.create",
    component: ShipmentForm,
    authRequired: true
  },
  {
    path: "/shipments/upload",
    name: "menu.shipments.upload",
    component: ShipmentBulkUpload,
    authRequired: true
  },
  {
    path: "/fleetOwners/list",
    name: "menu.fleetOwners.list",
    icon: "car",
    component: FleetOwnerList,
    authRequired: true
  },
  {
    path: "/fleetOwners/details/:id",
    name: "menu.fleetOwners.details",
    component: FleetOwnerDetails,
    authRequired: true
  },
  {
    path: "/fleetOwners/update/:id",
    name: "menu.fleetOwners.update",
    component: FleetOwnerForm,
    authRequired: true
  },
  {
    path: "/fleetOwners/create",
    name: "menu.fleetOwners.create",
    component: FleetOwnerForm,
    authRequired: true
  },
  {
    path: "/areas/list",
    name: "menu.areas.list",
    icon: "map-marked-alt",
    component: AreaList,
    authRequired: true
  },
  {
    path: "/areas/details/:id",
    name: "menu.areas.details",
    component: AreaDetails,
    authRequired: true
  },
  {
    path: "/areas/update/:id",
    name: "menu.areas.update",
    component: AreaForm,
    authRequired: true
  },
  {
    path: "/areas/create",
    name: "menu.areas.create",
    component: AreaForm,
    authRequired: true
  },
  {
    path: "/routes/list",
    name: "menu.routes.list",
    icon: "route",
    component: RouteList,
    authRequired: true
  },
  {
    path: "/routes/details/:id",
    name: "menu.routes.details",
    component: RouteDetails,
    authRequired: true
  },
  {
    path: "/routes/update/:id",
    name: "menu.routes.update",
    component: RouteForm,
    authRequired: true
  },
  {
    path: "/routes/create",
    name: "menu.routes.create",
    component: RouteForm,
    authRequired: true
  },
  {
    path: "/routeExceptions/list",
    name: "menu.routeExceptions.list",
    icon: "exclamation-circle",
    component: RouteExceptionList,
    authRequired: true
  },
  {
    path: "/routeExceptions/details/:id",
    name: "menu.routeExceptions.details",
    component: RouteExceptionDetails,
    authRequired: true
  },
  {
    path: "/routeExceptions/update/:id",
    name: "menu.routeExceptions.update",
    component: RouteExceptionForm,
    authRequired: true
  },
  {
    path: "/routeExceptions/create",
    name: "menu.routeExceptions.create",
    component: RouteExceptionForm,
    authRequired: true
  },
  {
    path: "/partners/list",
    name: "menu.partners.list",
    icon: "user-friends",
    component: PartnerList,
    authRequired: true
  },
  {
    path: "/partners/details/:id",
    name: "menu.partners.details",
    component: PartnerDetails,
    authRequired: true
  },
  {
    path: "/partners/update/:id",
    name: "menu.partners.update",
    component: PartnerForm,
    authRequired: true
  },
  {
    path: "/partners/create",
    name: "menu.partners.create",
    component: PartnerForm,
    authRequired: true
  },
  {
    path: "/partnerDiscounts/list",
    name: "menu.partnerDiscounts.list",
    icon: "piggy-bank",
    component: PartnerDiscountList,
    authRequired: true
  },
  {
    path: "/partnerDiscounts/details/:id",
    name: "menu.partnerDiscounts.details",
    component: PartnerDiscountDetails,
    authRequired: true
  },
  {
    path: "/partnerDiscounts/update/:id",
    name: "menu.partnerDiscounts.update",
    component: PartnerDiscountForm,
    authRequired: true
  },
  {
    path: "/partnerDiscounts/create",
    name: "menu.partnerDiscounts.create",
    component: PartnerDiscountForm,
    authRequired: true
  },
  {
    path: "/partnerCashInstances/list",
    name: "menu.partnerCashInstances.list",
    icon: "money-check-alt",
    component: PartnerCashInstanceList,
    authRequired: true
  },
  {
    path: "/partnerCashInstances/details/:id",
    name: "menu.partnerCashInstances.details",
    component: PartnerCashInstanceDetails,
    authRequired: true
  },
  {
    path: "/partnerCashInstances/update/:id",
    name: "menu.partnerCashInstances.update",
    component: PartnerCashInstanceForm,
    authRequired: true
  },
  {
    path: "/partnerCashInstances/create",
    name: "menu.partnerCashInstances.create",
    component: PartnerCashInstanceForm,
    authRequired: true
  },
  {
    path: "/reports",
    name: "menu.reports",
    icon: "list",
    component: ReportsForm,
    authRequired: true
  },
  {
    path: "/setting",
    name: "menu.settings",
    icon: "cog",
    component: SettingsForm,
    authRequired: true,
    roles: [ROLE.ADMIN]
  },
  {
    redirect: true,
    path: "/",
    to: "/liveOperations",
    name: "menu.liveOperations.redirect"
  }
];

export default operationsTeamRoutes;
