import React from 'react';
import PropTypes from 'prop-types';
import Event from './Event';

function DateSection({ day }) {
  const { events, title } = day;
  return (
    <div className="date_section">
      <h6 className="date_section__title">{title}</h6>
      {events
        && events.map(event => <Event key={event.created_at} event={event} />)}
    </div>
  );
}

DateSection.propTypes = {
  day: PropTypes.shape({
    title: PropTypes.string.isRequired,
    events: PropTypes.arrayOf(
      PropTypes.shape({
        created_at: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
};

export default DateSection;
