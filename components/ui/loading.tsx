export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-sky-500 to-fuchsia-500 opacity-60 blur-sm" />
        <div className="absolute inset-1 rounded-full border-4 border-t-transparent border-l-emerald-400 border-r-sky-400 border-b-fuchsia-400 animate-spin" />
        <div className="relative h-full w-full rounded-full bg-slate-900/80 dark:bg-slate-950/80" />
      </div>
    </div>
  );
}

