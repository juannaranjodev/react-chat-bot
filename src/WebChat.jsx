import memoize from 'memoize-one';
import React, { Component } from 'react';
import ReactWebChat, { createDirectLine, createStyleSet, connectToWebChat } from 'botframework-webchat';
import { css } from 'glamor'

import './WebChat.css';

const ACTIVITY_WITH_FEEDBACK_CSS = css({
  minHeight: 60,
  position: 'relative',
  '& > .activity': {
    paddingLeft: 40
  },
  '& > .button-bar': {
    listStyleType: 'none',
    margin: '0 0 0 10px',
    padding: 0,
    position: 'absolute',
    '& > li > button': {
      background: 'White',
      border: 'solid 1px #E6E6E6',
      cursor: 'pointer',
      marginBottom: 2,
      padding: '2px 5px 5px'
    }
  }
});

class ActivityWithFeedback extends Component {
  handleDownvoteButton = () => this.props.postActivity({
    type: 'message',
    name: 'evaluate-activity',
    value: { activityID: this.props.activityID, score: -1 } 
  })
  handleUpvoteButton = () => this.props.postActivity({
    type: 'message',
    name: 'evaluate-activity',
    value: { activityID: this.props.activityID, score: 1 } 
  })

  render() {
    const { props } = this;
    return (
      <div className={ ACTIVITY_WITH_FEEDBACK_CSS }>
        <ul className="button-bar">
          <li>
            <button onClick={ this.handleUpvoteButton }>
              <span role='img' aria-label="up">👍</span>
            </button>
          </li>
          <li>
            <button onClick={ this.handleDownvoteButton }>
              <span role='img' aria-label="down">👎</span>
            </button>
          </li>
        </ul>
        <div className="activity">
          { props.children }
        </div>
      </div>
    );
  }
}

const ConnectedActivityWithFeedback = connectToWebChat(
  ({ postActivity }) => ({ postActivity })
)(props => <ActivityWithFeedback { ...props } />)

const activityMiddleware = () => next => card => {
  if (card.activity.from.role === 'bot') {
    return (
      children =>
        <ConnectedActivityWithFeedback activityID={ card.activity.id }>
          { next(card)(children) }
        </ConnectedActivityWithFeedback>
    );
  } else {
    return next(card);
  }
};

export default class extends Component {
  constructor(props) {
    super(props);

    this.createDirectLine = memoize(token => createDirectLine({ token }));

    this.state = {
      styleSet: createStyleSet({
        backgroundColor: 'white',
        hideUploadButton: true
      })
    };
  }

  componentDidMount() {
    !this.props.token && this.props.onFetchToken();
  }

  render() {
    const {
      props: { className, store, token },
      state: { styleSet }
    } = this;

    styleSet.uploadButton.width = 0;
    
    return (
      token ?
        <ReactWebChat
          activityMiddleware={ activityMiddleware }
          className={ `${ className || '' } web-chat` }
          directLine={ this.createDirectLine(token) }
          store={ store }
          styleSet={ styleSet } /> 
      :
        <div className={ `${ className || '' } connect-spinner` }>
          <div className="content">
            <div className="icon">
              <span className="ms-Icon ms-Icon--Robot" />
            </div>
            <p>Please wait while we are connecting.</p>
          </div>
        </div>
    );
  }
}
