import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import TestList from './pages/TestList.jsx';
import TestPage from './pages/TestPage.jsx';
import Result from './pages/Result.jsx';
import AdminLogin from './admin/Login.jsx';
import RequireAdmin from './admin/RequireAdmin.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminDashboard from './admin/Dashboard.jsx';
import ManageCategories from './admin/ManageCategories.jsx';
import ManageTests from './admin/ManageTests.jsx';
import ManageQuestions from './admin/ManageQuestions.jsx';
import AdminResults from './admin/Results.jsx';
import AdminSettings from './admin/Settings.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category/:categoryId" element={<TestList />} />
      <Route path="/category/:categoryId/test/:testId" element={<TestPage />} />
      <Route path="/result/:attemptId" element={<Result />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="tests" element={<ManageTests />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
