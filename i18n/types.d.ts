import deCommon from "@/messages/de/common.json";
import deNavigation from "@/messages/de/navigation.json";
import deDashboard from "@/messages/de/dashboard.json";
import deLeads from "@/messages/de/leads.json";
import deCustomers from "@/messages/de/customers.json";
import dePrecheck from "@/messages/de/precheck.json";
import deRating from "@/messages/de/rating.json";
import deOffers from "@/messages/de/offers.json";
import deClosing from "@/messages/de/closing.json";
import dePortfolio from "@/messages/de/portfolio.json";

type AppMessages = {
  common: typeof deCommon;
  navigation: typeof deNavigation;
  dashboard: typeof deDashboard;
  leads: typeof deLeads;
  customers: typeof deCustomers;
  precheck: typeof dePrecheck;
  rating: typeof deRating;
  offers: typeof deOffers;
  closing: typeof deClosing;
  portfolio: typeof dePortfolio;
};

declare global {
  interface IntlMessages extends AppMessages {}
}

