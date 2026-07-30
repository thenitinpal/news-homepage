import { Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { CategoryPage } from "./pages/CategoryPage";
import { ArticlePage } from "./pages/ArticlePage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { WhoWeArePage } from "./pages/WhoWeArePage";
import { EditorialTeamPage } from "./pages/EditorialTeamPage";
import { AdvertiseWithUsPage } from "./pages/AdvertiseWithUsPage";
import { ContactPage } from "./pages/ContactPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AccountPage } from "./pages/AccountPage";
import { ForYouPage } from "./pages/ForYouPage";
import { LoginPage as AdminLoginPage } from "./pages/admin/LoginPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { ArticleFormPage } from "./pages/admin/ArticleFormPage";
import { AdsDashboardPage } from "./pages/admin/AdsDashboardPage";
import { AdFormPage } from "./pages/admin/AdFormPage";
import { ContactMessagesPage } from "./pages/admin/ContactMessagesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequireReader } from "./components/RequireReader";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:slug" element={<CategoryPage />} />
      <Route path="/article/:id" element={<ArticlePage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/who-we-are" element={<WhoWeArePage />} />
      <Route path="/editorial-team" element={<EditorialTeamPage />} />
      <Route path="/advertise" element={<AdvertiseWithUsPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/account"
        element={
          <RequireReader>
            <AccountPage />
          </RequireReader>
        }
      />
      <Route
        path="/for-you"
        element={
          <RequireReader>
            <ForYouPage />
          </RequireReader>
        }
      />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/new"
        element={
          <ProtectedRoute>
            <ArticleFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/:id/edit"
        element={
          <ProtectedRoute>
            <ArticleFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ads"
        element={
          <ProtectedRoute>
            <AdsDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ads/new"
        element={
          <ProtectedRoute>
            <AdFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ads/:id/edit"
        element={
          <ProtectedRoute>
            <AdFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute>
            <ContactMessagesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
