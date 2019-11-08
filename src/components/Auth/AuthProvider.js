import React, { Component } from "react";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

const AuthContext = React.createContext();

const PREFIX = "_jak_";

class AuthProvider extends Component {
  constructor(props) {
    super(props);

    this.login = (accessToken, user, remember) => {
      const encodedToken = btoa(accessToken);
      const encodedUser = btoa(JSON.stringify(user));
      if (remember) {
        Cookies.set(`${PREFIX}at`, encodedToken);
        Cookies.set(`${PREFIX}us`, encodedUser);
      } else {
        Cookies.set(`${PREFIX}at`, encodedToken, { expires: 1 });
        Cookies.set(`${PREFIX}us`, encodedUser, { expires: 1 });
      }
      this.setState({ isAuth: true });
    };

    this.logout = () => {
      Cookies.remove(`${PREFIX}at`);
      Cookies.remove(`${PREFIX}us`);
      this.setState({ isAuth: false });
    };

    this.getAccessToken = () => {
      const raw = Cookies.get(`${PREFIX}at`);
      return raw ? atob(raw) : null;
    };

    this.getUser = () => {
      const raw = Cookies.get(`${PREFIX}us`);
      return raw ? JSON.parse(atob(raw)) : null;
    };

    this.state = {
      isAuth: !!this.getAccessToken()
    };
  }

  render() {
    const { isAuth } = this.state;
    const { children } = this.props;
    return (
      <AuthContext.Provider
        value={{
          isAuth,
          login: this.login,
          logout: this.logout
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
}

AuthProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

AuthProvider.defaultProps = {
  children: null
};

const AuthConsumer = AuthContext.Consumer;

const withAuth = ChildComponent => {
  const AuthComponent = props => (
    <AuthContext.Consumer>
      {value => <ChildComponent {...props} auth={value} />}
    </AuthContext.Consumer>
  );
  return AuthComponent;
};

const AuthProps = PropTypes.shape({
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  isAuth: PropTypes.bool.isRequired
});

const hasRoles = roles => {
  const user = new AuthProvider().getUser();
  if (user === null) return false;
  const userRoles = user.roles.map(role => role.name);

  if (typeof roles === "string") {
    return userRoles.includes(roles);
  }

  let hasRights = false;
  if (Array.isArray(roles)) {
    roles.forEach(role => {
      if (hasRights) return;
      if (typeof role === "string") {
        hasRights = userRoles.includes(role);
      } else if (
        typeof role === "object" &&
        Object.keys(role).includes("name")
      ) {
        hasRights = userRoles.includes(role.name);
      }
    });
  }

  if (typeof roles === "object" && Object.keys(roles).includes("name")) {
    hasRights = userRoles.includes(roles.name);
  }

  return hasRights;
};

export { AuthProvider, AuthConsumer, withAuth, AuthProps, hasRoles };
export default AuthProvider;
