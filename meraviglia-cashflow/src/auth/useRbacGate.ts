import { useAuth } from "./useAuth"

export const useRbacGate = () => {
  const { rbac, rbacLoading } = useAuth()

  return {
    isAdmin: rbac.isAdmin,
    canManageRbac: rbac.canManageRbac,
    rbacLoading,
    canAccessAdminUi: rbac.isAdmin || rbac.canManageRbac,
  }
}
