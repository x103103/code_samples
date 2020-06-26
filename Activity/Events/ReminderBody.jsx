import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/IconCustom';
import DayJS from 'react-dayjs';

function ReminderBody({ reminder }) {
  const { datetime, done, title } = reminder;
  return (
    <div className="event-body-reminder">
      <div className="event-body-reminder__chexbox">
        {done ? (
          <div className="event-body-reminder__chexbox_true">
            <Icon icon="done" />
          </div>
        ) : (
          <div className="event-body-reminder__chexbox_false" />
        )}
      </div>
      <div className={`reminder__text_${done}`}>{title}</div>
      <div className="reminder__filler" />
      <div className={`reminder__date_${done}`}>
        <DayJS format="MMM DD, YYYY h:mm A">{datetime}</DayJS>
      </div>
    </div>
  );
}

ReminderBody.propTypes = {
  reminder: PropTypes.shape({
    title: PropTypes.string.isRequired,
    datetime: PropTypes.string.isRequired,
    done: PropTypes.bool.isRequired,
  }).isRequired,
};

export default ReminderBody;
