export default function Loading() {
  return (
    <div className="p-6 md:p-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="h-28 border-4 border-foreground bg-foreground/5 animate-pulse" />
        <div className="h-28 border-4 border-foreground bg-foreground/5 animate-pulse" />
        <div className="h-28 border-4 border-foreground bg-foreground/5 animate-pulse" />
      </div>
      <div className="border-4 border-foreground bg-foreground/5 h-[420px] animate-pulse" />
    </div>
  );
}
