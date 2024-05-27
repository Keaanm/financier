import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
  ErrorComponent,
  RouterProvider,
  createRouter,
} from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import "@/index.css";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { Loader2 } from "lucide-react";
import { SheetProvider } from "./providers/sheet-provider";
import { Toaster } from "./components/ui/sonner";
import { userQueryOptions } from "./lib/api";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className="p-5">
      <Loader2 className="stroke-sky-600 animate-spin" />
    </div>
  ),
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  defaultPreload: "intent",
  context: {
    queryClient: queryClient,
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
});
// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const { data: auth, isLoading } = useQuery(userQueryOptions);
  if (isLoading) {
    return (
      <div className="p-5">
        <Loader2 className="stroke-sky-600 animate-spin" />
      </div>
    );
  }
  return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors />
        <SheetProvider />
        <InnerApp />
      </QueryClientProvider>
    </StrictMode>
  );
}

// Render the app
const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
