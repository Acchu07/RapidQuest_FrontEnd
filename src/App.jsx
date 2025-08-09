import { useState, useEffect } from "react";
import { getData } from "./fetchApi";
import {v4 as uuidv4} from "uuid";

const URL = "http://localhost:3000/";
const retrievalURL = `${URL}api/messages/1`;
const submissionUrl = `${URL}api/messages`;

/*
Refactor 
  the calculation part to backend after task 3
  components to individual fiels
*/

function App() {
  const [dataStore, setDataStore] = useState(); // Refactor to context api this is a pain to deal with
  const [isPhone, setIsPhone] = useState(false);
  // const [errorNotifications, setErrorNotifications] = useState(null); 

  useEffect(() => {
    async function setUpDB() {
      const fetchRequest = new Request(retrievalURL);
      const data = await getData(fetchRequest);
    setDataStore(data);
    setIsPhone(window.navigator.userAgent.includes("Mobile"));
    }             
    setUpDB();
  }, []);

  if (!dataStore) {
    return <p>Retrieving Data...</p>;
  }
  return (
    <>
      <Chat setDataStore={setDataStore} dataStore={dataStore} isPhone={isPhone} />
    </>
  );
}

function Chat({ setDataStore, dataStore, isPhone }) {
  const [selectedWaId, setSelectedWaId] = useState(null);

  const hashMapUserData = new Map(); 

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

  hashMapUserData.forEach((chat) => {
    chat.messages.sort(
      (a, b) => a.timestamp - b.timestamp
    );
  });

  const chatList = Array.from(hashMapUserData.values()); // Since code was changed this could be done different maybe directly use names from state
  const chatMessages = hashMapUserData.get(selectedWaId); // Rethink what the hashmap needs to store just identify and put in essentials only instead of all

  // console.log(chatList)

/*
Reptition with mobile and desktop possible to make just one?
*/
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
      <div className="flex h-screen w-screen m-0.5 p-0.5 relative">
        {selectedWaId !== null&& <IndividualChat setDataStore={setDataStore} dataStore={dataStore} chatMessage={chatMessages} />}
      </div>
      <div className="sticky bottom-0 ">
        {isPhone && selectedWaId !== null && (
          <button className="btn btn-wide btn-info" onClick={() => setSelectedWaId(null)}>Go Back</button>
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
          <div className="flex items-center justify-center w-full h-full">
            <p>Chat Screen</p>
          </div>
        ) : (
          <IndividualChat setDataStore={setDataStore} dataStore={dataStore} chatMessage={chatMessages} />
        )}
      </div>
    </div>
  );
}

function IndividualChat({ setDataStore, dataStore, chatMessage }) {
  return (
    <div className="m-0.5 p-0.5">
      {chatMessage.messages.map((msg) => (
        <div
          key={msg._id}
          className={`chat ${
            msg.direction === "outgoing" ? "chat-end" : "chat-start"
          }`}
        >
          {/* Seperate condition to make only outgoing sent delievered and read have color rather than both? */}
          <div
            className={`chat-bubble ${
              msg.status === "read"
                ? "chat-bubble-success"
                : msg.status === "sent"
                ? "chat-bubble-neutral"
                : "chat-bubble-info"
            }`}
          >
            <p className="text-lg lg:text-base">{msg.text}</p>
          </div>
        </div>
      ))}
      <SendMessageForm setDataStore={setDataStore} dataStore={dataStore} message={chatMessage} />
    </div>
  );
}

function SendMessageForm({setDataStore, dataStore, message}){
// To be replaced once i pick up socket.io the format of the jsons provided is not the same as the one i need to send
const [isSending, setIsSending] = useState(false);
const { messages: [messages] } = message;

  async function handleSumbit(e){
    setIsSending(true);
    e.preventDefault();
    const newMessage = {
      _id: uuidv4(),
      name: messages.name,
      wa_id: messages.wa_id,
      from: messages.from,
      text: e.target.message.value,
      direction: "outgoing",
      status: "sent",
      timestamp: Date.now(),
    }
    const fetchRequest = new Request(submissionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessage),
    });
    const data = await getData(fetchRequest);
    const dataToPush = [...dataStore, data];
    setDataStore(dataToPush);
    setIsSending(false);
  }
  function handleTextChange(e){
    // ToDo Needs validation put controlled element
  }
  return (
    <form onSubmit={handleSumbit} className="flex gap-2 flex-col mt-4 lg:flex-row">
      <textarea name="message" placeholder="Send Message" className="textarea textarea-md w-full lg:h-24" />
      <button type="submit" disabled={isSending} className="btn btn-info lg:h-24">Send</button>
    </form>
  );
}

export default App;
