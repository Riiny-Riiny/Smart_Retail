"use client"

import { useState } from "react"
import { useOrganization } from "@/hooks/useOrganization"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Building2, ChevronDown, Plus, Crown, Shield, User, Eye } from "lucide-react"

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  VIEWER: Eye,
}

const planColors = {
  FREE: "bg-gray-100 text-gray-800",
  STARTER: "bg-blue-100 text-blue-800",
  PROFESSIONAL: "bg-purple-100 text-purple-800",
  ENTERPRISE: "bg-gold-100 text-gold-800",
}

export function OrganizationSwitcher() {
  const { currentOrganization, organizations, switchOrganization, isLoading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading || !currentOrganization) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  const RoleIcon = roleIcons[currentOrganization.role as keyof typeof roleIcons] || User

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{currentOrganization.name}</span>
              <div className="flex items-center space-x-1">
                <RoleIcon className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500 capitalize">
                  {currentOrganization.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {organizations.map((org) => {
          const OrgRoleIcon = roleIcons[org.role as keyof typeof roleIcons] || User
          const isActive = org.id === currentOrganization.id
          
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className={`flex items-center justify-between p-3 cursor-pointer ${
                isActive ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                  isActive ? "bg-blue-600" : "bg-gray-400"
                }`}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{org.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <OrgRoleIcon className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500 capitalize">
                        {org.role.toLowerCase()}
                      </span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${planColors[org.subscription?.plan as keyof typeof planColors] || planColors.FREE}`}
                    >
                      {org.subscription?.plan || "FREE"}
                    </Badge>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          )
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 