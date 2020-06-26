import React from 'react';
import PropTypes from 'prop-types';

function ListBody({ list_title: listName }) {
  return (
    <div className="event-body-list">
      <span className="event-body-list__text">{listName}</span>
    </div>
  );
}

ListBody.propTypes = {
  list_title: PropTypes.string.isRequired,
};

export default ListBody;
