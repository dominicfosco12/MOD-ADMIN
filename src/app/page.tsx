export default function Home() {
  return (
    <main className="container-page">
      <div className="card max-w-xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Tailwind v4 is <span className="text-blue-600">live</span> 🚀
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-neutral-300">
          If you can see these styles, your setup is correct.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90">
            Primary Action
          </button>
          <button className="px-4 py-2 rounded-lg border border-black/10 hover:bg-black/5 dark:hover:bg-white/5">
            Secondary
          </button>
        </div>
      </div>
    </main>
  );
}
