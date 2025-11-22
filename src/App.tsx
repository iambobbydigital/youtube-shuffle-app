import { PlaylistPlayer } from '@/components/PlaylistPlayer'

function App() {
  return (
    <div className="h-[100dvh] w-full bg-zinc-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">
        Focus Music
      </h1>
      <div className="w-full max-w-5xl">
        <PlaylistPlayer />
      </div>
    </div>
  )
}

export default App
