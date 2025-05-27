"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  status: string
  role: string
  subscription?: {
    plan: string
    status: string
    currentPeriodEnd?: string
  }
}

export function useOrganization() {
  const { data: session, status } = useSession()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      setIsLoading(false)
      return
    }

    // Extract organizations from session
    const userOrgs = session.user.organizations?.map((org: any) => ({
      id: org.organization.id,
      name: org.organization.name,
      slug: org.organization.slug,
      plan: org.organization.plan,
      status: org.organization.status,
      role: org.role,
      subscription: org.organization.subscription
    })) || []

    setOrganizations(userOrgs)

    // Set current organization from URL or default to first
    const orgSlugFromUrl = pathname.split('/')[1]
    const orgFromUrl = userOrgs.find(org => org.slug === orgSlugFromUrl)
    
    if (orgFromUrl) {
      setCurrentOrganization(orgFromUrl)
    } else if (userOrgs.length > 0) {
      setCurrentOrganization(userOrgs[0])
      // Redirect to the organization's dashboard if not already there
      if (!pathname.startsWith(`/${userOrgs[0].slug}`) && pathname !== '/dashboard') {
        router.push(`/dashboard`)
      }
    }

    setIsLoading(false)
  }, [session, status, pathname, router])

  const switchOrganization = (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId)
    if (org) {
      setCurrentOrganization(org)
      router.push(`/dashboard`)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!currentOrganization) return false
    
    const role = currentOrganization.role
    
    switch (permission) {
      case "admin":
        return ["OWNER", "ADMIN"].includes(role)
      case "member":
        return ["OWNER", "ADMIN", "MEMBER"].includes(role)
      case "viewer":
        return ["OWNER", "ADMIN", "MEMBER", "VIEWER"].includes(role)
      default:
        return false
    }
  }

  const canAccessFeature = (feature: string): boolean => {
    if (!currentOrganization?.subscription) return false
    
    const plan = currentOrganization.subscription.plan
    
    switch (feature) {
      case "advanced_analytics":
        return ["PROFESSIONAL", "ENTERPRISE"].includes(plan)
      case "api_access":
        return ["PROFESSIONAL", "ENTERPRISE"].includes(plan)
      case "custom_integrations":
        return plan === "ENTERPRISE"
      case "unlimited_products":
        return ["PROFESSIONAL", "ENTERPRISE"].includes(plan)
      case "priority_support":
        return plan === "ENTERPRISE"
      default:
        return true // Basic features available to all
    }
  }

  const getFeatureLimits = () => {
    if (!currentOrganization?.subscription) return null
    
    const plan = currentOrganization.subscription.plan
    
    switch (plan) {
      case "FREE":
        return {
          products: 10,
          competitors: 3,
          alerts: 50,
          users: 1
        }
      case "STARTER":
        return {
          products: 100,
          competitors: 10,
          alerts: 500,
          users: 5
        }
      case "PROFESSIONAL":
        return {
          products: 1000,
          competitors: 50,
          alerts: 5000,
          users: 25
        }
      case "ENTERPRISE":
        return {
          products: -1, // unlimited
          competitors: -1,
          alerts: -1,
          users: -1
        }
      default:
        return null
    }
  }

  return {
    currentOrganization,
    organizations,
    isLoading,
    switchOrganization,
    hasPermission,
    canAccessFeature,
    getFeatureLimits,
    isAuthenticated: !!session?.user,
    user: session?.user
  }
} 