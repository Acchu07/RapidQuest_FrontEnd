import data from "./data"
import { useState } from "react"
 /* 
  WhatsApp Web Like
  Process the data on the backend? -Ask about it later 
*/

// ToDO last fix the types
// Filter out the Unrequired data
function App() {

  return (
    <>
    <Chat />
    </>
  )
}

function Chat() {
  const [selectedWaId, setSelectedWaId] = useState(null);

  const grouped = new Map();

  data.forEach((msg) => {
    if (!grouped.has(msg.wa_id)) {
      grouped.set(msg.wa_id, {
        name: msg.name,
        wa_id: msg.wa_id,
        // Better array too many uneeded values maybe rethink what should be stored in db
        messages: [] 
      });
    }
    grouped.get(msg.wa_id).messages.push(msg);
  });

  // Sort messages on backend? or sort before making a map
  grouped.forEach((chat) => {
    chat.messages.sort(
      (a, b) => new Date(a.timestamp.$date) - new Date(b.timestamp.$date)
    );
  });

  const chatList = Array.from(grouped.values());

  console.log(chatList)

  return (
    <div>
      {chatList.map((chat) => (
        <div
          key={chat.wa_id}
          onClick={() => setSelectedWaId(chat.wa_id)}
        >
          <p>Name: {chat.name}</p>
          {selectedWaId === chat.wa_id &&
            chat.messages.map((m) => (
              <IndividualChat key={m._id} chatMessage={m} />
            ))}
        </div>
      ))}
    </div>
  );
}

function IndividualChat({ chatMessage }) {
  return (
    <div>
      <p>Direction: {chatMessage.direction}</p>
      <p>Status: {chatMessage.status}</p>
      <p>{chatMessage.text}</p>
    </div>
  );
}


export default App
