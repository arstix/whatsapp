import './App.css';
import Sidebar from './Sidebar'
import Chat from './Chat'
import Pusher from "pusher-js"
import { useEffect, useState } from "react"
import axios from "./axios"




function App() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    axios.get('/messages/sync')
      .then(response => {
        console.log(response.data)
        setMessages(response.data)
      })
  }, [])

  useEffect(() => {
    const pusher = new Pusher('18cb7cbe146a85782a41', {
   cluster: 'eu'
 });

 const channel = pusher.subscribe('messages');
  channel.bind('inserted', (newMessage) => {
    alert(JSON.stringify(newMessage));
    setMessages([...messages, newMessage])
  });

  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  }
}, [messages])

  return (
    <div className="App">
      <div className="app__body">
      <Sidebar />
      <Chat messages={messages}/>
      </div>
    </div>
  );
}

export default App;
