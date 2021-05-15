import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import { formatRelative } from "date-fns";

firebase.initializeApp({
  // config
  apiKey: "AIzaSyDYdHNr3BT8muQ5-TV5T8J9IMCqyqHBC5k",
  authDomain: "mychatapp-e1036.firebaseapp.com",
  projectId: "mychatapp-e1036",
  storageBucket: "mychatapp-e1036.appspot.com",
  messagingSenderId: "796576615799",
  appId: "1:796576615799:web:a4ff964c3751a1a72ce572",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1>😄</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    // retrieve google provider object
    const provider = new firebase.auth.GoogleAuthProvider();
    // set language to default browser preference
    auth.useDeviceLanguage();
    // Start sign in process
    auth.signInWithPopup(provider);
  };

  return (
    <button className="sign-in" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          💌
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={photoURL || "https://www.gravatar.com/avatar?r=pg&d=robohash"}
        />
        <p>{text}</p>
        {/* <div>
          {displayName ? <p>{displayName}</p> : null}
          {createdAt?.seconds ? (
            <span className="createdAt">
              {formatRelative(new Date(createdAt.seconds * 1000), new Date())}
            </span>
          ) : null}
        </div> */}
      </div>
    </>
  );
}

export default App;
