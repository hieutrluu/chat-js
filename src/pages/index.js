import React, {useRef} from 'react';
import {Replicache} from 'replicache';
import {useSubscribe} from 'replicache-react';
import {nanoid} from 'nanoid';
// import { io } from "socket.io-client";
import { getSocket } from './socket.js';
import { defaultSpaceID } from './const.js';

const rep = process.browser
  ? new Replicache({
      name: 'chat-user-id',
      licenseKey: 'lf3725ce0b5bd44fd94d379b41d03d98e',
      pushURL: '/api/replicache-push',
      pullURL: '/api/replicache-pull',
      mutators: {
        async createMessage(tx, {id, from, content, order}) {
          await tx.put(`message/${id}`, {
            from,
            content,
            order,
          });
        },
      },
    })
  : null;

if (rep) {
  // listen for default channel
  var socket = getSocket('localhost:9000');
  socket.on('connect', (data) => {
    console.log(data);
    console.log('listening for poke');
  });
  socket.on('default', (data) => {
    console.log('received poke in default');
  rep.pull();
  });
  socket.on('test', (data) => {
    console.log('received poke in test');
    rep.pull();
  });

  socket.on('test2', (data) => {
    console.log('received poke in test2');
    rep.pull();
  });
  // listen(rep);
}

export default function Home() {
  return <Chat rep={rep} />;
}

function Chat({rep}) {
  const messages = useSubscribe(
    rep,
    async tx => {
      const list = await tx.scan({prefix: 'message/'}).entries().toArray();
      list.sort(([, {order: a}], [, {order: b}]) => a - b);
      return list;
    },
    [],
  );

  const usernameRef = useRef();
  const contentRef = useRef();

  const onSubmit = e => {
    // TODO: Create message
    e.preventDefault();
  const last = messages.length && messages[messages.length - 1][1];
  const order = (last?.order ?? 0) + 1;
  rep.mutate.createMessage({
    id: nanoid(),
    from: usernameRef.current.value,
    content: contentRef.current.value,
    order,
  });
  contentRef.current.value = '';
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={onSubmit}>
        <input ref={usernameRef} style={styles.username} required />
        says:
        <input ref={contentRef} style={styles.content} required />
        <input type="submit" />
      </form>
      <MessageList messages={messages} />
    </div>
  );
}

function MessageList({messages}) {
  return messages.map(([k, v]) => {
    return (
      <div key={k}>
        <b>{v.from}: </b>
        {v.content}
      </div>
    );
  });
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  form: {
    display: 'flex',
    flexDirection: 'row',
    flex: 0,
    marginBottom: '1em',
  },
  username: {
    flex: 0,
    marginRight: '1em',
  },
  content: {
    flex: 1,
    maxWidth: '30em',
    margin: '0 1em',
  },
};

// Define your client class

// function listen(rep) {
//   console.log('listening');

//   // Use the socket instance to emit or receive events
//   socket.on(defaultSpaceID, (data) => {
//     console.log('on default');
//     console.log(data);
//   });

//   socket.on('poke', (data) => {
//     console.log('on poke');
//     console.log(data);
//   });

// }