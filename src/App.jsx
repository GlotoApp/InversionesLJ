import { useState } from "react";
import HomePage from "./pages/HomePage";
import SimulatorPage from "./pages/SimulatorPage";
import NewCreditPage from "./pages/NewCreditPage";
import PortfolioPage from "./pages/PortfolioPage";
import CreditDetailPage from "./pages/CreditDetailPage";

export default function App() {
  const [page, setPage] = useState("home");

  const navigate = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  const pages = {
    home: <HomePage navigate={navigate} />,
    simulator: <SimulatorPage navigate={navigate} />,
    newCredit: <NewCreditPage navigate={navigate} />,
    portfolio: <PortfolioPage navigate={navigate} />,
    creditDetail: <CreditDetailPage navigate={navigate} />,
  };

  return (
    <div className="max-w-md mx-auto min-h-screen px-4 py-6 bg-slate-50">
      {pages[page] ?? pages.home}
    </div>
  );
}
