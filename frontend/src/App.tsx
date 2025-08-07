import Chatbot from './components/chatbot';

function App() {
  return (
    <div className="flex flex-col h-screen w-screen">
      
      {/* Header */}
      <header className="absolute top-0 left-0 p-4">
        <h1 className="text-xl font-bold text-white text-shadow">Lannz ChatBot</h1>
      </header>

      {/* Main Chat Component */}
      <main className="bg-gray-100 w-full min-h-screen p-4">
        <Chatbot />
      </main>

    </div>
  );
}

export default App;