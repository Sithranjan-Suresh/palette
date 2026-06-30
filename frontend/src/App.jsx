import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Sparkles, IceCreamCone, DollarSign, PartyPopper, Flame } from "lucide-react";
import "./App.css";
import IngredientForm from "./components/IngredientForm";
import FlavorChart from "./components/FlavorChart";
import RecipeCard from "./components/RecipeCard";
import TweakControls from "./components/TweakControls";
import MenuRefreshResults from "./components/MenuRefreshResults";
import KeptMenuPanel from "./components/KeptMenuPanel";
import ToastStack from "./components/ToastStack";
import Loader from "./components/Loader";
import LandingPage from "./components/LandingPage";
import { fetchBaselineMenu, fetchGapTarget, generateDrink, refreshMenu, pingBackend } from "./api";

const LOADER_DURATION_MS = 2200;

const DEBOUNCE_MS = 400;
const GAP_DEBOUNCE_MS = 350;
const KEPT_MENU_STORAGE_KEY = "palette_kept_menu";
const DRINKS_INVENTED_KEY = "palette_drinks_invented";

function drinkToMenuItem(drink) {
  return {
    name: drink.name,
    flavor: drink.flavor,
    ingredients: drink.ratios.map((r) => r.ingredient),
  };
}

function loadKeptMenu() {
  try {
    const raw = localStorage.getItem(KEPT_MENU_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadDrinksInvented() {
  const raw = localStorage.getItem(DRINKS_INVENTED_KEY);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

const headerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const headerItem = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 18 } },
};

const floatLoop = (delay) => ({
  y: [-8, 8, -8],
  rotate: [-4, 4, -4],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
});

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [view, setView] = useState("landing");

  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const [baselineMenu, setBaselineMenu] = useState([]);
  const [generationRequest, setGenerationRequest] = useState(null);
  const [generatedDrink, setGeneratedDrink] = useState(null);
  const [gapTarget, setGapTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [styleConstraint, setStyleConstraint] = useState("");

  const [refreshItems, setRefreshItems] = useState([]);
  const [refreshFailedCount, setRefreshFailedCount] = useState(0);
  const [refreshCount, setRefreshCount] = useState(4);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);

  const [keptMenu, setKeptMenu] = useState(loadKeptMenu);
  const [drinksInvented, setDrinksInvented] = useState(loadDrinksInvented);
  const [toasts, setToasts] = useState([]);

  const debounceRef = useRef(null);
  const gapDebounceRef = useRef(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    // Fire-and-forget ping to wake the Render free-tier backend immediately on mount
    // so it's warm by the time the user hits "Compute drink".
    pingBackend();
    fetchBaselineMenu()
      .then(setBaselineMenu)
      .catch(() => setError("Couldn't load the baseline menu."));
  }, []);

  useEffect(() => {
    fetchGapTarget(styleConstraint, keptMenu).then(setGapTarget).catch(() => {});
  }, [keptMenu]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem(KEPT_MENU_STORAGE_KEY, JSON.stringify(keptMenu));
  }, [keptMenu]);

  useEffect(() => {
    localStorage.setItem(DRINKS_INVENTED_KEY, String(drinksInvented));
  }, [drinksInvented]);

  function pushToast(text, Icon) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text, Icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }

  function handleStyleConstraintChange(value) {
    setStyleConstraint(value);
    if (gapDebounceRef.current) clearTimeout(gapDebounceRef.current);
    gapDebounceRef.current = setTimeout(() => {
      fetchGapTarget(value, keptMenu).then(setGapTarget).catch(() => {});
    }, GAP_DEBOUNCE_MS);
  }

  function runGeneration(request) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);
      // a fresh single generation replaces any batch view on screen
      setRefreshItems([]);
      try {
        const drink = await generateDrink({ ...request, extra_menu: keptMenu });
        setGeneratedDrink(drink);
        setGenerationRequest(request);

        if (!request.tweak) {
          setDrinksInvented((prev) => {
            const next = prev + 1;
            if (prev === 0) {
              pushToast("First drink invented!", PartyPopper);
            }
            return next;
          });
          if (drink.cost_source === "computed") {
            pushToast(
              drink.priced_with_reference_data
                ? "Cost computed (reference prices)"
                : "Cost computed from your prices",
              DollarSign
            );
          }
        }
      } catch (err) {
        setError(err.message || "Couldn't generate, try again.");
      } finally {
        setIsLoading(false);
        inFlightRef.current = false;
      }
    }, DEBOUNCE_MS);
  }

  function handleSubmit(request) {
    runGeneration(request);
  }

  function handleTweak(tweak) {
    if (!generationRequest || !generatedDrink) return;
    runGeneration({
      ...generationRequest,
      tweak,
      previous_drink: generatedDrink,
    });
  }

  async function handleRefresh(payload) {
    setIsRefreshing(true);
    setRefreshError(null);
    // a menu refresh replaces any single-drink view on screen
    setGeneratedDrink(null);
    try {
      const result = await refreshMenu({ ...payload, count: refreshCount, extra_menu: keptMenu });
      setRefreshItems(result.items);
      setRefreshFailedCount(result.failed_count || 0);
      setDrinksInvented((prev) => prev + result.items.length);
      pushToast(`${result.items.length} new drinks invented!`, Sparkles);
    } catch (err) {
      setRefreshError(err.message || "Couldn't refresh the menu, try again.");
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleKeepDrink(drink) {
    setKeptMenu((prev) => {
      if (prev.some((item) => item.name === drink.name)) return prev;
      const next = [...prev, drinkToMenuItem(drink)];
      pushToast(`Menu streak: ${next.length}`, Flame);
      return next;
    });
  }

  function handleRemoveKept(name) {
    setKeptMenu((prev) => prev.filter((item) => item.name !== name));
  }

  const refreshDrinks = refreshItems.map((item) => item.drink);
  const refreshTargets = refreshItems.map((item) => item.gap_target);
  const keptNames = new Set(keptMenu.map((item) => item.name));

  if (appLoading) {
    return (
      <AnimatePresence>
        <Loader />
      </AnimatePresence>
    );
  }

  if (view === "landing") {
    return <LandingPage onStart={() => setView("app")} />;
  }

  return (
    <div className="app">
      <ToastStack toasts={toasts} />

      <motion.header
        className="app-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div animate={floatLoop(0)} className="header-float" style={{ top: -6, right: 220 }}>
          <Coffee size={30} />
        </motion.div>
        <motion.div animate={floatLoop(0.7)} className="header-float" style={{ top: 18, right: 80 }}>
          <IceCreamCone size={24} />
        </motion.div>
        <motion.div animate={floatLoop(1.3)} className="header-float" style={{ top: -2, right: 150 }}>
          <Sparkles size={20} />
        </motion.div>

        <motion.p variants={headerItem} className="header-eyebrow">
          ☕ Flavor-space engine for cafés
        </motion.p>
        <motion.h1
          variants={headerItem}
          className="app-title-link"
          onClick={() => setView("landing")}
          role="button"
          tabIndex={0}
        >
          Palette
        </motion.h1>
        <motion.p variants={headerItem} className="tagline">
          It doesn't look up a recipe. It computes one.
        </motion.p>

        <motion.div variants={headerItem} className="stats-bar">
          <span className="stat-chip stat-chip--orange">
            <span className="stat-chip-icon"><Coffee size={15} /></span>
            {drinksInvented} drink{drinksInvented === 1 ? "" : "s"} invented
          </span>
          {keptMenu.length > 0 && (
            <span className="stat-chip stat-chip--green">
              <span className="stat-chip-icon"><Flame size={15} /></span>
              {keptMenu.length} on your menu
            </span>
          )}
        </motion.div>
      </motion.header>

      <main>
        <section className="input-section">
          <IngredientForm
            onSubmit={handleSubmit}
            onRefresh={handleRefresh}
            onStyleConstraintChange={handleStyleConstraintChange}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            refreshCount={refreshCount}
            onRefreshCountChange={setRefreshCount}
          />
          {generatedDrink && (
            <TweakControls onTweak={handleTweak} disabled={isLoading} />
          )}
          <KeptMenuPanel keptMenu={keptMenu} onRemove={handleRemoveKept} />
        </section>

        <section className="results-section">
          <FlavorChart
            baselineMenu={baselineMenu}
            keptMenu={keptMenu}
            generatedDrink={refreshItems.length === 0 ? generatedDrink : null}
            gapTarget={refreshItems.length === 0 ? gapTarget : null}
            generatedDrinks={refreshDrinks}
            gapTargets={refreshTargets}
          />
          {isLoading && (
            <p className="loading-indicator">
              Computing the flavor gap
              <span className="loading-dots"><span /><span /><span /></span>
            </p>
          )}
          {isRefreshing && (
            <p className="loading-indicator">
              Computing {refreshCount} coordinated gaps and drinks
              <span className="loading-dots"><span /><span /><span /></span>
            </p>
          )}
          {error && <p className="generation-error">{error}</p>}
          {refreshError && <p className="generation-error">{refreshError}</p>}

          {refreshItems.length === 0 ? (
            <RecipeCard
              drink={generatedDrink}
              onKeep={handleKeepDrink}
              isKept={generatedDrink ? keptNames.has(generatedDrink.name) : false}
            />
          ) : (
            <MenuRefreshResults
              items={refreshItems}
              failedCount={refreshFailedCount}
              onKeep={handleKeepDrink}
              keptNames={keptNames}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
