import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import TestList from "@/pages/TestList";
import TestDetail from "@/pages/TestDetail";
import TestRun from "@/pages/TestRun";
import ResultDetail from "@/pages/ResultDetail";
import CommunityList from "@/pages/CommunityList";
import PostDetail from "@/pages/PostDetail";
import ProfileManage from "@/pages/ProfileManage";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary">로딩중...</div>;
  if (!user) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-bounce text-primary text-2xl font-bold">마음이음</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <Navigation />
      <main>
        <Switch>
          <Route path="/" component={user ? Dashboard : Landing} />
          
          <Route path="/tests" component={TestList} />
          <Route path="/tests/:id" component={TestDetail} />
          <Route path="/tests/:id/run">
            <ProtectedRoute component={TestRun} />
          </Route>
          
          <Route path="/results" component={() => user ? <Dashboard /> : <Redirect to="/" />} /> {/* Fallback to dashboard for list */}
          <Route path="/results/:id">
            <ProtectedRoute component={ResultDetail} />
          </Route>
          
          <Route path="/community" component={CommunityList} />
          <Route path="/community/:id" component={PostDetail} />
          
          <Route path="/profile">
            <ProtectedRoute component={ProfileManage} />
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <footer className="bg-secondary/30 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p className="font-bold mb-2 text-primary/70">마음이음 (INPSYT)</p>
          <p>© 2024 Maum-Ium. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
