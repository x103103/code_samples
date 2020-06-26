import React from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';

function NoteBody({ text }) {
  return <div className="event-body-note">{ReactHtmlParser(text)}</div>;
}

NoteBody.propTypes = {
  text: PropTypes.string.isRequired,
};

export default NoteBody;
