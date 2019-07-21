import React, { Component } from 'react';
import { createStore, createStyleSet } from 'botframework-webchat';

import WebChat from './WebChat';

import './fabric-icons-inline.css';
import './MinimizableWebChat.css';

export default class extends Component {
  constructor(props) {
    super(props);
  
    const store = createStore({}, ({ dispatch }) => next => action => {
      if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        if (action.payload.activity.from.role === 'bot') {
          this.setState(() => ({ newMessage: true }));
        }
      }

      return next(action);
    });

    store.getState().activities.push({
      name: 'webchat/join',
      type: 'message',
      text: "Hello I'm Digital Assistant.\n\nYou can ask me general questions.\n\nIf you'd like to know more, type help.\n\n How can I help you today?",
      from: { role: 'bot' },
    });

    this.state = {
      store,
      styleSet: createStyleSet({
        backgroundColor: 'white'
      }),
      token: null
    };
  }

  handleFetchToken = async () => {
    if (!this.state.token) {
      const res = await fetch('https://anna.govlawtech.com.au/api/directlineToken', { method: 'POST' });
      const { token } = await res.json();
      this.setState(() => ({ token }));
    }
  }

  render() {
    const { state: {
      store,
      styleSet,
      token
    } } = this;

    return (
      <div className="minimizable-web-chat">
        {
          <div className={ 'chat-box' }>
            <div className= {'chat-box-header'}>
              <div className="chat-box-header-text">
                Ask "ANNA": Army, Navy 'n' Airforce
              </div>
            </div>
              
            <WebChat
              className="react-web-chat"
              onFetchToken={ this.handleFetchToken }
              store={ store }
              styleSet={ styleSet }
              token={ token } />
          </div>
        }
      </div>
    );
  }
}
