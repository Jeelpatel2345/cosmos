import React, { useState } from "react";
import { SocketProvider } from "./context/SocketContext";
import { CosmosProvider } from "./context/CosmosContext";
import JoinScreen from "./components/JoinScreen";
import CosmosApp from "./components/CosmosApp";

const App = () => {
  const [joinData, setJoinData] = useState(null);

  return (
    <SocketProvider>
      <CosmosProvider>
        {!joinData ? (
          <JoinScreen onJoin={setJoinData} />
        ) : (
          <CosmosApp joinData={joinData} />
        )}
      </CosmosProvider>
    </SocketProvider>
  );
};

export default App;
