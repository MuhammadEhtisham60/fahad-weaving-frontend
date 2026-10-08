// ─── Redux Store ────────────────────────────────────────────────
export { store } from "./store.js";

// ─── Auth State Slice & Hooks ──────────────────────────────────
export {
  setCredentials,
  tokenRefreshed,
  setUser,
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAccessToken,
} from "./authSlice.js";
export { useAuth } from "../hooks/useAuth.js";

// ─── RTK Query: Auth Endpoints ──────────────────────────────────
export {
  useSignupMutation,
  useLoginMutation,
  useLogoutApiMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
} from "./authApiSlice.js";

// ─── RTK Query: Users Endpoints ─────────────────────────────────
export {
  useGetUserStatsQuery,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserStatusMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
} from "./usersApiSlice.js";

// ─── RTK Query: Roles & Permissions Endpoints ───────────────────
export {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
} from "./rolesApiSlice.js";

// ─── RTK Query: Activity Logs Endpoints ─────────────────────────
export {
  useGetActivitiesQuery,
  useLazyGetActivitiesQuery,
} from "./activitiesApiSlice.js";

// ─── RTK Query: Supplier Endpoints ──────────────────────────────
export {
  useGetSupplierStatsQuery,
  useGetSupplierChoicesQuery,
  useGetSuppliersQuery,
  useLazyGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useLazyGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  usePatchSupplierMutation,
  useDeleteSupplierMutation,
} from "./supplierApiSlice.js";

// ─── RTK Query: Customer Endpoints ──────────────────────────────
export {
  useGetCustomerStatsQuery,
  useGetCustomerChoicesQuery,
  useGetCustomersQuery,
  useLazyGetCustomersQuery,
  useGetCustomerByIdQuery,
  useLazyGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  usePatchCustomerMutation,
  useDeleteCustomerMutation,
} from "./customerApiSlice.js";

// ─── RTK Query: Beam Endpoints ──────────────────────────────────
export {
  useGetBeamStatsQuery,
  useGetBeamChoicesQuery,
  useGetBeamsQuery,
  useLazyGetBeamsQuery,
  useGetBeamByIdQuery,
  useLazyGetBeamByIdQuery,
  useGetAvailableBeamsQuery,
  useLazyGetAvailableBeamsQuery,
  useGetBeamSizingHistoryQuery,
  useLazyGetBeamSizingHistoryQuery,
  useGetBeamActiveAssignmentQuery,
  useLazyGetBeamActiveAssignmentQuery,
  useGetBeamLoadingHistoryQuery,
  useLazyGetBeamLoadingHistoryQuery,
  useCreateBeamMutation,
  useUpdateBeamMutation,
  usePatchBeamMutation,
  useDeleteBeamMutation,
  useReleaseBeamMutation,
} from "./beamApiSlice.js";

// ─── RTK Query: Loom Endpoints ──────────────────────────────────
export {
  useGetLoomStatsQuery,
  useGetLoomChoicesQuery,
  useGetLoomsQuery,
  useLazyGetLoomsQuery,
  useGetLoomByIdQuery,
  useLazyGetLoomByIdQuery,
  useCreateLoomMutation,
  useUpdateLoomMutation,
  usePatchLoomMutation,
  useDeleteLoomMutation,
} from "./loomApiSlice.js";

// ─── RTK Query: Yarn Intake Endpoints ───────────────────────────
export {
  useGetYarnIntakeStatsQuery,
  useGetYarnIntakesQuery,
  useLazyGetYarnIntakesQuery,
  useGetYarnIntakeByIdQuery,
  useLazyGetYarnIntakeByIdQuery,
  useCreateYarnIntakeMutation,
  useUpdateYarnIntakeMutation,
  usePatchYarnIntakeMutation,
  useDeleteYarnIntakeMutation,
} from "./yarnIntakeApiSlice.js";

// ─── RTK Query: Yarn Outcome Endpoints ──────────────────────────
export {
  useGetYarnOutcomesQuery,
  useLazyGetYarnOutcomesQuery,
  useGetYarnOutcomeByIdQuery,
  useLazyGetYarnOutcomeByIdQuery,
  useCreateYarnOutcomeMutation,
  useUpdateYarnOutcomeMutation,
  usePatchYarnOutcomeMutation,
  useDeleteYarnOutcomeMutation,
} from "./yarnOutcomeApiSlice.js";

// ─── RTK Query: Sizing Units Endpoints ──────────────────────────
export {
  useGetSizingChoicesQuery,
  useGetSizingsQuery,
  useLazyGetSizingsQuery,
  useGetSizingByIdQuery,
  useLazyGetSizingByIdQuery,
  useGetSizingOutcomesBySizingIdQuery,
  useCreateSizingMutation,
  useUpdateSizingMutation,
  usePatchSizingMutation,
  useDeleteSizingMutation,
} from "./sizingApiSlice.js";

// ─── RTK Query: Sizing Outcome Endpoints ────────────────────────
export {
  useGetSizingOutcomesQuery,
  useLazyGetSizingOutcomesQuery,
  useGetSizingOutcomeByIdQuery,
  useLazyGetSizingOutcomeByIdQuery,
  useGetOutcomeBeamsQuery,
  useCreateSizingOutcomeMutation,
  useUpdateSizingOutcomeMutation,
  usePatchSizingOutcomeMutation,
  useDeleteSizingOutcomeMutation,
  useAssignBeamsToOutcomeMutation,
  useReleaseBeamFromOutcomeMutation,
} from "./sizingOutcomeApiSlice.js";

// ─── RTK Query: Beam Loading & Loom Mounting Endpoints ──────────
export {
  useGetBeamLoadingsQuery,
  useLazyGetBeamLoadingsQuery,
  useGetActiveBeamLoadingsQuery,
  useLazyGetActiveBeamLoadingsQuery,
  useGetBeamLoadingByIdQuery,
  useLazyGetBeamLoadingByIdQuery,
  useCreateBeamLoadingMutation,
  useCreateBatchBeamLoadingMutation,
  usePatchBeamLoadingMutation,
  useDeleteBeamLoadingMutation,
  useEmptyBeamLoadingMutation,
} from "./beamLoadingApiSlice.js";

// ─── RTK Query: Production Endpoints ────────────────────────────
export {
  useGetProductionStatsQuery,
  useGetProductionsQuery,
  useLazyGetProductionsQuery,
  useGetProductionByIdQuery,
  useLazyGetProductionByIdQuery,
  useCreateProductionMutation,
  usePatchProductionMutation,
  useDeleteProductionMutation,
} from "./productionApiSlice.js";

// ─── RTK Query: Sizing Beam Assignment Lifecycle Endpoints ──────
export {
  useGetSizingBeamAssignmentsQuery,
  useLazyGetSizingBeamAssignmentsQuery,
  useGetSizingBeamAssignmentByIdQuery,
  useLazyGetSizingBeamAssignmentByIdQuery,
  useTransitionBeamAssignmentMutation,
  useReleaseBeamAssignmentMutation,
} from "./sizingBeamAssignmentApiSlice.js";

// ─── RTK Query: Daily Ledger Endpoints ─────────────────────────
export {
  useGetDailyLedgerSummaryQuery,
  useLazyGetDailyLedgerSummaryQuery,
  useGetDailyLedgerSheetViewQuery,
  useLazyGetDailyLedgerSheetViewQuery,
  useGetDailyLedgerChoicesQuery,
  useGetDailyLedgerStatsQuery,
  useGetDailyLedgersQuery,
  useLazyGetDailyLedgersQuery,
  useGetDailyLedgerByIdQuery,
  useLazyGetDailyLedgerByIdQuery,
  useGetDailyLedgerByDateQuery,
  useLazyGetDailyLedgerByDateQuery,
  useCreateDailyLedgerMutation,
  useUpdateDailyLedgerMutation,
  useDeleteDailyLedgerMutation,
  useRecalculateDailyLedgerMutation,
  useGetLedgerTransactionsQuery,
  useLazyGetLedgerTransactionsQuery,
  useGetLedgerTransactionByIdQuery,
  useLazyGetLedgerTransactionByIdQuery,
  useCreateLedgerTransactionMutation,
  useCreateIncomingTransactionMutation,
  useCreateOutgoingTransactionMutation,
  useUpdateLedgerTransactionMutation,
  useDeleteLedgerTransactionMutation,
} from "./dailyLedgerApiSlice.js";


