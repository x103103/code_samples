import React, {
  useEffect, useContext, Fragment,
} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getUserEventsThunk } from 'thunks/activity.thunk';
import DrawerContext from 'components/ProfileDrawer/DrawerContext';
import DateSection from './DateSection';

function Activity({ activity, fetchUserEvents }) {
  const { follower } = useContext(DrawerContext);

  useEffect(() => {
    fetchUserEvents(follower.id);
  }, [follower.id, fetchUserEvents]);

  return activity.length ? (
    <Fragment>
      <div className="activity">
        {activity.map(day => (
          <DateSection day={day} key={day.title}/>
        ))}
      </div>
    </Fragment>
  ) : (
    <div className="activity">
      <div className="activity-no-data">There was no activity yet</div>
    </div>
  );
}

Activity.propTypes = {
  activity: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      events: PropTypes.arrayOf(
        PropTypes.shape({
          created_at: PropTypes.string,
        }),
      ),
    }),
  ),
};

Activity.defaultProps = {
  activity: [],
};

const mapStateToProps = ({ activity }) => ({
  activity: activity.events,
});

const mapDispatchToProps = {
  fetchUserEvents: getUserEventsThunk,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Activity);
