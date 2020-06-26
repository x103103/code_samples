import React from 'react';
import PropTypes from 'prop-types';

const LabelBody = ({ labels }) => (
  <div className="event-body-label">
    {labels.map(label => (
      <div key={label} className="event-body-label-single">
        {label}
      </div>
    ))}
  </div>
);

LabelBody.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default LabelBody;
