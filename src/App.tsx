import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-xs border-zinc-800 bg-zinc-950 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Volume2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-white">SonicBackground</CardTitle>
          <p className="text-sm text-muted-foreground">Phase 1 Foundation Ready</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button className="w-full" variant="default">
            Environment Setup Verified
          </Button>
          <p className="text-center text-xs text-zinc-500 uppercase tracking-widest font-medium">
            Tauri • Tailwind v4 • Shadcn
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
