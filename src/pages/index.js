import React, {useRef} from 'react';
import {Replicache} from 'replicache';
import {useSubscribe} from 'replicache-react';
import {nanoid} from 'nanoid';
import Pusher from 'pusher-js';
import { io } from "socket.io-client";

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
  listen(rep);
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

function listen(rep) {
  console.log('listening');
  const socket = io();
  // socket.on("connect", () => {
  //   console.log(socket.connected); // true
  // });
  
  // socket.on("disconnect", () => {
  //   console.log(socket.connected); // false
  // });
  socket.on("connect", () => {
    const engine = socket.io.engine;
    console.log(engine.transport.name); // in most cases, prints "polling"
  
    engine.on("poke", (arg) => {
      console.log('on poke');
      console.log(arg); // world
      rep.pull();
    });

    engine.on("default", (arg) => {
      console.log('on default');
      console.log(arg); // world
      rep.pull();
    });

    engine.once("upgrade", () => {
      // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
      console.log(engine.transport.name); // in most cases, prints "websocket"
    });
  
    engine.on("packet", ({ type, data }) => {
      // called for each packet received
    });
  
    engine.on("packetCreate", ({ type, data }) => {
      // called for each packet sent
    });
  
    engine.on("drain", () => {
      // called when the write buffer is drained
    });
  
    engine.on("close", (reason) => {
      // called when the underlying connection is closed
    });
  });
  // Listen for pokes, and pull whenever we get one.
  // Pusher.logToConsole = true;
  // const pusher = new Pusher(process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_KEY, {
  //   cluster: process.env.NEXT_PUBLIC_REPLICHAT_PUSHER_CLUSTER,
  // });
  // const channel = pusher.subscribe('default');
  // channel.bind('poke', () => {
  //   console.log('got poked');
  //   rep.pull();
  // });
}