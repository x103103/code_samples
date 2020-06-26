import React from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';

function MessageBody({ subject, text }) {
  return (
    <div className="event-body-messages">
      <div className="event-body-messages__subject">{subject}</div>
      <div className="event-body-messages__text">{ReactHtmlParser(text)}</div>
    </div>
  );
}

MessageBody.propTypes = {
  subject: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default MessageBody;
