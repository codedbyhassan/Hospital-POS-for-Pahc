import { useLocation, useNavigate } from "react-router-dom";
import { Home, Clock, Package, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const items = [{ path: "/", icon: Home, label: "Sell" }, { path: "/history", icon: Clock, label: "History" }, { path: "/items", icon: Package, label: "Items" }, { path: "/data", icon: Database, label: "Data" }];
  return <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl md:hidden"><div className="grid grid-cols-4 gap-1">{items.map(({ path, icon: Icon, label }) => { const active = location.pathname === path; return <button type="button" key={path} onClick={() => navigate(path)} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon className="size-4" />{label}</button>; })}</div></nav>;
};
export default MobileNav;
