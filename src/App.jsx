import data from "./data";
import { useState, useEffect } from "react";
/* 
  WhatsApp Web Like
  Process the data on the backend? -Ask about it later 
*/

// ToDO last fix the types
// Filter out the Unrequired data
function App() {
  const [dataStore, setDataStore] = useState();
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    setDataStore(data);
    console.log(window.navigator.userAgent);
    setIsPhone(window.navigator.userAgent.includes("Mobile"));
  }, []);

  if (!dataStore) {
    return <p>Retrieving Data...</p>;
  }
  return (
    <>
      <Chat dataStore={dataStore} isPhone={isPhone} />
    </>
  );
}

function Chat({ dataStore, isPhone }) {
  const [selectedWaId, setSelectedWaId] = useState(null);

  const hashMapUserData = new Map(); // Rethink what the hashmap needs to store just identify and put in essentials only instead of all

  dataStore.forEach((msg) => {
    if (!hashMapUserData.has(msg.wa_id)) {
      hashMapUserData.set(msg.wa_id, {
        name: msg.name,
        wa_id: msg.wa_id,
        messages: [],
      });
    }
    hashMapUserData.get(msg.wa_id).messages.push(msg);
  });

  // Sort messages on backend? or sort before making a map
  hashMapUserData.forEach((chat) => {
    chat.messages.sort(
      (a, b) => new Date(a.timestamp.$date) - new Date(b.timestamp.$date)
    );
  });

  const chatList = Array.from(hashMapUserData.values()); // Since code was changed this could be done different maybe directly use names from state
  const chatMessages = hashMapUserData.get(selectedWaId); // Rethink what the hashmap needs to store just identify and put in essentials only instead of all

  // console.log(chatList)

// Reptition with mobile and desktop possible to make just one?
  if (isPhone && selectedWaId === null) {
    return (
      <div className="flex h-screen w-screen m-0.5 p-0.5 justify-center">
        <div className="m-0.5 p-0.5">
          {chatList.map((chat) => (
            <div
              className="block btn btn-ghost leading-10 "
              key={chat.wa_id}
              onClick={() => setSelectedWaId(chat.wa_id)}
            >
              <p>{chat.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isPhone && selectedWaId !== null) {
    return (
      <>
      <div className="flex h-screen w-screen m-0.5 p-0.5">
        {selectedWaId === null ? (
          <p>Chat Screen</p>
        ) : (
          <IndividualChat chatMessage={chatMessages} />
        )}
      </div>
      <div>
        {isPhone && selectedWaId !== null && (
          <button onClick={() => setSelectedWaId(null)}>Go Back</button>
        )}
      </div>
      </>
    );
  }

  return (
    <div className="flex h-screen m-0.5 p-0.5">
      <div className="m-0.5 p-0.5">
        {chatList.map((chat) => (
          <div
            className="block btn btn-ghost leading-10 "
            key={chat.wa_id}
            onClick={() => setSelectedWaId(chat.wa_id)}
          >
            <p>{chat.name}</p>
          </div>
        ))}
      </div>

      <div className="divider divider-horizontal"></div>

      <div className="flex-1">
        {selectedWaId === null ? (
          <p>Chat Screen</p>
        ) : (
          <IndividualChat chatMessage={chatMessages} />
        )}
      </div>
    </div>
  );
}

function IndividualChat({ chatMessage }) {
  return (
    <div className="m-0.5 p-0.5">
      {chatMessage.messages.map((msg) => (
        // Using the wamid long string here - so it is required
        <div
          key={msg._id}
          className={`chat ${
            msg.direction === "outgoing" ? "chat-end" : "chat-start"
          }`}
        >
          <div
            className={`chat-bubble ${
              msg.status === "read"
                ? "chat-bubble-success"
                : msg.status === "sent"
                ? "chat-bubble-neutral"
                : "chat-bubble-info"
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
