import OperationsTeamLayout from "../layouts/OperationsTeam/OperationsTeamLayout";
import operationsTeamRoutes from "./operationsTeam";
import CleanLayout from "../layouts/Clean/CleanLayout";
import cleanRoutes from "./clean";

const indexRoutes = Array.prototype.concat(
  cleanRoutes.map(route => ({ layout: CleanLayout, ...route })),
  operationsTeamRoutes.map(route => ({
    layout: OperationsTeamLayout,
    ...route
  }))
);

export default indexRoutes;
