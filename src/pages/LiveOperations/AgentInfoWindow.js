import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import T from "i18n-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AgentInfoWindow = props => {
  const { agent } = props;
  const { id, name, friendlyId, phone, status } = agent;

  return (
    <div>
      <strong>Name: </strong>
      {name}
      <br />

      <strong>Identifier: </strong>
      {friendlyId}
      <br />

      <strong>Phone: </strong>
      {phone}
      <br />

      <strong>Status: </strong>
      {status.name}

      <hr className="my-2" />

      <Link
        className="btn btn-primary btn-sm btn-block"
        to={{
          pathname: `/agents/details/${id}`,
          state: {
            modal: true,
            modalTitle: T.translate("agents.detail.title")
          }
        }}
      >
        <FontAwesomeIcon icon="user" className="mr-2" />{" "}
        {T.translate("liveOperations.liveView.agentDetailsButton")}
      </Link>
    </div>
  );
};

AgentInfoWindow.propTypes = {
  agent: PropTypes.shape({
    name: PropTypes.string,
    friendlyId: PropTypes.string,
    phone: PropTypes.string,
    status: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    })
  }).isRequired
};

export default AgentInfoWindow;
