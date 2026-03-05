import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import IntroPage from "./pages/IntroPage";
import HubPage from "./pages/HubPage";
import PuzzlePage from "./pages/PuzzlePage";
import MarvelPuzzlePage from "./pages/MarvelPuzzlePage";
import PotterPuzzlePage from "./pages/PotterPuzzlePage";
import StrangerPuzzlePage from "./pages/StrangerPuzzlePage";
import StrangerSignalPage from "./pages/StrangerSignalPage";
import FinalePage from "./pages/FinalePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/hub" element={<HubPage />} />
          <Route path="/world/marvel" element={<MarvelPuzzlePage />} />
          <Route path="/world/potter" element={<PotterPuzzlePage />} />
          <Route path="/world/stranger" element={<StrangerPuzzlePage />} />
          <Route path="/world/stranger-signal" element={<StrangerSignalPage />} />
          <Route path="/world/:worldId" element={<PuzzlePage />} />
          <Route path="/finale" element={<FinalePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
