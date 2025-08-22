import "./App.css";
import Pages from "@/pages/index.jsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store/store";

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Pages />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
