import { useCallback, useState } from "react";
import type React from "react";
import type { Screen } from "./types";
import { getAdminToken } from "./api/client";
import { Landing, AuthModal } from "./screens/landing/LandingScreens";
import { BegStep1, BegStep2, BegStep3, BegStep4, BegStep5, BegResult, BegDetail } from "./screens/beginner/BeginnerScreens";
import { ExpStep1, ExpStep2, ExpStep3, ExpStep4, ExpStep5, ExpResult, ExpDetail } from "./screens/expert/ExpertScreens";
import { AdmDashboard } from "./screens/admin/AdmDashboard";
import { AdmProductMaster } from "./screens/admin/AdmProductMaster";
import { AdmCsvImport } from "./screens/admin/AdmCsvImport";
import { AdmSourcing } from "./screens/admin/AdmSourcing";
import { AdmPricePolicy } from "./screens/admin/AdmPricePolicy";
import { AdmRecommendWeights } from "./screens/admin/AdmRecommendWeights";
import { AdmKeywords } from "./screens/admin/AdmKeywords";
import { AdmClickReport } from "./screens/admin/AdmClickReport";
import { AdmFunnel } from "./screens/admin/AdmFunnel";
import { AdmSystemLimit } from "./screens/admin/AdmSystemLimit";
import { AdmOperators } from "./screens/admin/AdmOperators";
import { AdmSharedBoard } from "./screens/admin/AdmSharedBoard";
import { DevHub } from "./screens/dev/DevHub";

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => (
    new URLSearchParams(window.location.search).has("operator_invite") ? "auth-modal" : "landing"
  ));
  const [adminReturnScreen, setAdminReturnScreen] = useState<Screen | null>(null);
  const navigate = useCallback((nextScreen: Screen) => {
    if (nextScreen.startsWith("adm-") && !getAdminToken()) {
      setAdminReturnScreen(nextScreen);
      setScreen("auth-modal");
      window.scrollTo(0, 0);
      return;
    }
    if (nextScreen !== "auth-modal") {
      setAdminReturnScreen(null);
    }
    setScreen(nextScreen);
    window.scrollTo(0, 0);
  }, []);

  const screenMap: Record<Screen, React.ReactNode> = {
    landing: <Landing navigate={navigate} />,
    "auth-modal": <AuthModal navigate={navigate} returnScreen={adminReturnScreen} />,
    "beg-step1": <BegStep1 navigate={navigate} />,
    "beg-step2": <BegStep2 navigate={navigate} />,
    "beg-step3": <BegStep3 navigate={navigate} />,
    "beg-step4": <BegStep4 navigate={navigate} />,
    "beg-step5": <BegStep5 navigate={navigate} />,
    "beg-result": <BegResult navigate={navigate} />,
    "beg-detail": <BegDetail navigate={navigate} />,
    "exp-step1": <ExpStep1 navigate={navigate} />,
    "exp-step2": <ExpStep2 navigate={navigate} />,
    "exp-step3": <ExpStep3 navigate={navigate} />,
    "exp-step4": <ExpStep4 navigate={navigate} />,
    "exp-step5": <ExpStep5 navigate={navigate} />,
    "exp-result": <ExpResult navigate={navigate} />,
    "exp-detail": <ExpDetail navigate={navigate} />,
    "adm-dashboard": <AdmDashboard navigate={navigate} />,
    "adm-product-master": <AdmProductMaster navigate={navigate} />,
    "adm-csv-import": <AdmCsvImport navigate={navigate} />,
    "adm-sourcing": <AdmSourcing navigate={navigate} />,
    "adm-price-policy": <AdmPricePolicy navigate={navigate} />,
    "adm-recommend-weights": <AdmRecommendWeights navigate={navigate} />,
    "adm-keywords": <AdmKeywords navigate={navigate} />,
    "adm-click-report": <AdmClickReport navigate={navigate} />,
    "adm-funnel": <AdmFunnel navigate={navigate} />,
    "adm-system-limit": <AdmSystemLimit navigate={navigate} />,
    "adm-operators": <AdmOperators navigate={navigate} />,
    "adm-board": <AdmSharedBoard navigate={navigate} />,
    "dev-hub": <DevHub navigate={navigate} />,
  };

  return (
    <div style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      {screenMap[screen]}
    </div>
  );
}
