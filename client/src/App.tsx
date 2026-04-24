import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Search from "./pages/Search";
import Product from "./pages/Product";
import Compare from "./pages/Compare";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categoria/:slug" component={Category} />
      <Route path="/buscar" component={Search} />
      <Route path="/produto/:slug" component={Product} />
      <Route path="/comparar" component={Compare} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
