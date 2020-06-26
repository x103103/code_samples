import React from 'react';
import Icon from 'components/IconCustom';
import DayJS from 'react-dayjs';
import MessageBody from './Events/MessageBody';
import NoteBody from './Events/NoteBody';
import ReminderBody from './Events/ReminderBody';
import LabelBody from './Events/LabelBody';
import ListBody from './Events/ListBody';

const EVENT_STATES = {
  message: {
    body: MessageBody,
    iconType: 'chat_bubble_outline',
    actions: {
      sent: 'You sent a message',
      received: 'You received a message',
    },
  },
  note: {
    body: NoteBody,
    iconType: 'inbox',
    actions: {
      updated: 'You updated a note',
    },
  },
  reminder: {
    body: ReminderBody,
    iconType: 'notifications_none',
    actions: {
      created: 'You created a reminder',
      completed: 'You completed a reminder',
      deleted: 'You deleted a reminder',
      updated: 'You updated a reminder',
    },
  },
  label: {
    body: LabelBody,
    iconType: 'label',
    actions: { added: 'You added labels', removed: 'You removed labels' },
  },
  list: {
    body: ListBody,
    iconType: 'playlist_add_check',
    actions: {
      added: 'You added this profile to list',
      removed: 'You removed this profile to list',
    },
  },
};

function Event({ event }) {
  const {
    event_type: eventType, action, created_at: createdAt, data,
  } = event;

  const {
    body: ActivityBodyComponent,
    iconType,
    actions,
  } = EVENT_STATES[eventType];
  return (
    <div className="event">
      <div className="event-header">
        <div className="event-header__icon">
          <Icon className="colorBlueDark" icon={`${iconType} small`} />
        </div>
        <div>
          <div className="event-header__title">{actions[action]}</div>
          <div className="event-header__date">
            <DayJS format="MMMM D, YYYY h:mm A">{createdAt}</DayJS>
          </div>
        </div>
      </div>
      <div className="event-body">
        <ActivityBodyComponent {...data} />
      </div>
    </div>
  );
}

export default Event;
