export const roles = ["customer", "catalog", "warehouse", "finance", "administrator"] as const
export type Role = (typeof roles)[number]

export type NavLink = {
  href: string
  label: string
  roles: Role[] | "all"
}

export const shopLinks: NavLink[] = [
  { href: "/", label: "Home", roles: "all" },
  { href: "/catalog", label: "Catalog", roles: "all" },
  { href: "/orders", label: "Orders", roles: ["customer", "warehouse", "finance", "administrator"] },
  { href: "/returns", label: "Returns", roles: ["customer", "warehouse", "finance", "administrator"] },
  { href: "/account", label: "Account", roles: "all" },
]

export const officeLinks: NavLink[] = [
  { href: "/office", label: "Overview", roles: ["catalog", "warehouse", "finance", "administrator"] },
  { href: "/office/products", label: "Products", roles: ["catalog", "administrator"] },
  { href: "/office/inventory", label: "Inventory", roles: ["catalog", "warehouse", "administrator"] },
  { href: "/office/orders", label: "Orders", roles: ["warehouse", "finance", "administrator"] },
  { href: "/office/refunds", label: "Refunds", roles: ["finance", "administrator"] },
  { href: "/office/reports", label: "Reports", roles: ["finance", "administrator"] },
  { href: "/office/simulation", label: "Simulation", roles: ["administrator"] },
]

export function isRole(value: string | null | undefined): value is Role {
  return roles.includes(value as Role)
}

export function canAccess(role: Role | null | undefined, allowed: Role[] | "all") {
  if (allowed === "all") return true
  if (!role) return false
  return allowed.includes(role)
}

export function linksForRole(links: NavLink[], role: Role | null | undefined, signedIn: boolean) {
  return links.filter((link) => {
    if (link.href === "/orders" || link.href === "/returns") return signedIn && canAccess(role, link.roles)
    if (link.roles === "all") return true
    return signedIn && canAccess(role, link.roles)
  })
}

export function isStaff(role: Role | null | undefined) {
  return role === "catalog" || role === "warehouse" || role === "finance" || role === "administrator"
}

export const demoAccounts = [
  { role: "customer" as const, name: "Avery Chen", email: "customer@acme-retail.example" },
  { role: "catalog" as const, name: "Mina Patel", email: "catalog@acme-retail.example" },
  { role: "warehouse" as const, name: "Luis Ortega", email: "warehouse@acme-retail.example" },
  { role: "finance" as const, name: "Nora Blake", email: "finance@acme-retail.example" },
  { role: "administrator" as const, name: "Sam Okonkwo", email: "admin@acme-retail.example" },
]

export const demoPassword = "DemoPass123!"
