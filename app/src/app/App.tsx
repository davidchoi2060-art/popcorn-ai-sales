import { useCallback, useEffect, useState } from "react";
import type React from "react";
import { SCREENS, type Screen } from "./types";
import { getAdminToken } from "./api/client";

const SCREEN_SET = new Set<string>(SCREENS);

// 현재 URL(쿼리스트링)에서 화면을 해석한다. 초대 링크는 항상 인증 모달로.
function resolveScreenFromUrl(): Screen {
  const params = new URLSearchParams(window.location.search);
  if (params.has("operator_invite")) return "auth-modal";
  const s = params.get("screen");
  return s && SCREEN_SET.has(s) ? (s as Screen) : "landing";
}

// 관리자 화면은 토큰이 없으면 인증 모달로 가드. 표시할 화면과 복귀 대상을 반환.
function guardScreen(target: Screen): { screen: Screen; returnScreen: Screen | null } {
  if (target.startsWith("adm-") && !getAdminToken()) {
    return { screen: "auth-modal", returnScreen: target };
  }
  return { screen: target, returnScreen: null };
}

function urlForScreen(screen: Screen): string {
  return screen === "landing" ? window.location.pathname : `${window.location.pathname}?screen=${screen}`;
}
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
  const [screen, setScreen] = useState<Screen>(() => guardScreen(resolveScreenFromUrl()).screen);
  const [adminReturnScreen, setAdminReturnScreen] = useState<Screen | null>(() => guardScreen(resolveScreenFromUrl()).returnScreen);

  const navigate = useCallback((nextScreen: Screen) => {
    const { screen: target, returnScreen } = guardScreen(nextScreen);
    if (returnScreen) {
      setAdminReturnScreen(returnScreen);
    } else if (nextScreen !== "auth-modal") {
      setAdminReturnScreen(null);
    }
    setScreen(target);
    window.scrollTo(0, 0);
    window.history.pushState({ screen: target }, "", urlForScreen(target));
  }, []);

  // 브라우저 뒤로/앞으로(popstate): URL을 기준으로 화면 복원.
  useEffect(() => {
    const onPopState = () => {
      const { screen: target, returnScreen } = guardScreen(resolveScreenFromUrl());
      setAdminReturnScreen(returnScreen);
      setScreen(target);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
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
