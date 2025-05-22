// src/router/index.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Auth Components
import ProtectedRoute from '../components/auth/ProtectedRoute'
import LoginPage from '../features/Auth/LoginPage'
import RegisterPage from '../features/Auth/RegisterPage'

// Layout and Pages
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../features/Dashboard'
import ProfilePage from '../features/Profile/ProfilePage'
import DevicesPage from '../features/Devices/DevicesPage'
import DeviceTypesPage from '../features/DeviceTypes/DeviceTypesPage'
import LocationsPage from '../features/Locations/LocationsPage'
import LocationsTreePage from '../features/Locations/LocationsTreePage'
import InventoryEventsPage from '../features/Inventory/InventoryEventsPage'
import MaintenanceTasksPage from '../features/Maintenance/MaintenanceTasksPage'
import FailureRecordsPage from '../features/Failures/FailureRecordsPage'
import ReplacementSuggestionsPage from '../features/Suggestions/ReplacementSuggestionsPage'
import WriteOffReportsPage from '../features/Writeoffs/WriteOffReportsPage'
import AnalyticsPage from '../features/Analytics/AnalyticsPage'
import RoleBasedRoute from '../components/auth/RoleBasedRoute'
import PartTypesPage from '../features/PartTypes/PartTypesPage'
import DeviceMovementsPage from '../features/Devices/DeviceMovementsPage'
import MovementsPage from '../features/Movements/MovementsPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="device-types" element={
            <RoleBasedRoute>
              <DeviceTypesPage />
            </RoleBasedRoute>
          } />
          <Route path="locations" element={
            <RoleBasedRoute>
              <LocationsTreePage />
            </RoleBasedRoute>
          } />
          <Route path="inventory-events" element={<InventoryEventsPage />} />
          <Route path="maintenance-tasks" element={<MaintenanceTasksPage />} />
          <Route path="devices/:deviceId/failures" element={<FailureRecordsPage />} />
          <Route path="replacement-suggestions" element={<ReplacementSuggestionsPage />} />
          <Route path="write-off-reports" element={<WriteOffReportsPage />} />
          <Route path="analytics" element={
            <RoleBasedRoute requiredRole="admin">
              <AnalyticsPage />
            </RoleBasedRoute>
          } />
          <Route path="part-types" element={
            <RoleBasedRoute requiredRole="admin">
              <PartTypesPage />
            </RoleBasedRoute>
          } />
          <Route path="devices/:deviceId/movements" element={
            <RoleBasedRoute>
              <DeviceMovementsPage />
            </RoleBasedRoute>
          } />
          <Route path="movements" element={
            <RoleBasedRoute requiredRole="admin">
              <MovementsPage />
            </RoleBasedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
