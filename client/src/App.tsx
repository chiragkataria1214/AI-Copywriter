import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MetaAdGenerator from "@/pages/meta-ad-generator";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  const { isLoading, isAuthenticated, isUnauthenticated } = useAuth();
  const [location] = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login/register pages only
  if (isUnauthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route component={Login} /> {/* Default to login for any other route */}
      </Switch>
    );
  }

  // If authenticated, show main app
  if (isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={MetaAdGenerator} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Fallback - shouldn't reach here, but show login just in case
  return <Login />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
