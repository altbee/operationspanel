import LoginForm from "../pages/Login/LoginForm";
import ForgotPasswordForm from "../pages/ForgotPassword/ForgotPasswordForm";
import LogoutPage from "../pages/Login/LogoutPage";
import { ForbiddenPage } from "../pages/Errors/ForbiddenPage";

/**
 * Define routes and sidebar links at the same time.
 * Note that only items with 'icon' property and
 * without 'redirect' property will be rendered on sidebar.
 * @type {Object[]}
 */
const cleanRoutes = [
  {
    path: "/login",
    name: "login.title",
    component: LoginForm
  },
  {
    path: "/forgotPassword",
    name: "forgotPassword.title",
    component: ForgotPasswordForm
  },
  {
    path: "/logout",
    name: "logout.title",
    component: LogoutPage
  },
  {
    path: "/forbidden",
    name: "forbidden.title",
    component: ForbiddenPage
  }
];

export default cleanRoutes;
