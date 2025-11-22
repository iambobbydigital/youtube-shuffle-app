import { PlaylistPlayer } from '@/components/PlaylistPlayer'

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">
        YouTube Shuffle Player
      </h1>
      <div className="w-full max-w-5xl">
        <PlaylistPlayer />
      </div>
    </div>
  )
}

export default App
