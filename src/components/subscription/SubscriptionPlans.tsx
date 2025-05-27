"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Building2, Sparkles } from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"

const plans = [
  {
    id: "FREE",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    interval: "month",
    icon: Sparkles,
    features: [
      "Up to 10 products",
      "3 competitor tracking",
      "50 alerts per month",
      "Basic analytics",
      "Email support",
    ],
    limits: {
      products: 10,
      competitors: 3,
      alerts: 50,
      users: 1,
    },
    popular: false,
  },
  {
    id: "STARTER",
    name: "Starter",
    description: "For small businesses",
    price: 29,
    interval: "month",
    icon: Zap,
    features: [
      "Up to 100 products",
      "10 competitor tracking",
      "500 alerts per month",
      "Advanced analytics",
      "Priority email support",
      "API access",
    ],
    limits: {
      products: 100,
      competitors: 10,
      alerts: 500,
      users: 5,
    },
    popular: true,
  },
  {
    id: "PROFESSIONAL",
    name: "Professional",
    description: "For growing businesses",
    price: 99,
    interval: "month",
    icon: Building2,
    features: [
      "Up to 1,000 products",
      "50 competitor tracking",
      "5,000 alerts per month",
      "Advanced analytics & reports",
      "Priority support",
      "API access",
      "Custom integrations",
      "Team collaboration",
    ],
    limits: {
      products: 1000,
      competitors: 50,
      alerts: 5000,
      users: 25,
    },
    popular: false,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    description: "For large organizations",
    price: 299,
    interval: "month",
    icon: Crown,
    features: [
      "Unlimited products",
      "Unlimited competitor tracking",
      "Unlimited alerts",
      "Advanced analytics & reports",
      "24/7 priority support",
      "Full API access",
      "Custom integrations",
      "Team collaboration",
      "Dedicated account manager",
      "Custom onboarding",
    ],
    limits: {
      products: -1,
      competitors: -1,
      alerts: -1,
      users: -1,
    },
    popular: false,
  },
]

interface SubscriptionPlansProps {
  onSelectPlan?: (planId: string) => void
  showCurrentPlan?: boolean
}

export function SubscriptionPlans({ onSelectPlan, showCurrentPlan = true }: SubscriptionPlansProps) {
  const { currentOrganization } = useOrganization()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const currentPlan = currentOrganization?.subscription?.plan || "FREE"

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) return
    
    setIsLoading(planId)
    
    try {
      if (onSelectPlan) {
        await onSelectPlan(planId)
      } else {
        // Default behavior - redirect to checkout
        const response = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId,
            organizationId: currentOrganization?.id,
          }),
        })

        const data = await response.json()
        
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch (error) {
      console.error("Error selecting plan:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => {
        const Icon = plan.icon
        const isCurrentPlan = currentPlan === plan.id
        const isDowngrade = plans.findIndex(p => p.id === currentPlan) > plans.findIndex(p => p.id === plan.id)
        
        return (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? "border-blue-500 shadow-lg" : ""} ${
              isCurrentPlan ? "ring-2 ring-green-500" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            
            {isCurrentPlan && showCurrentPlan && (
              <Badge className="absolute -top-2 right-4 bg-green-500">
                Current Plan
              </Badge>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/{plan.interval}</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrentPlan || isLoading === plan.id}
              >
                {isLoading === plan.id ? (
                  "Processing..."
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : isDowngrade ? (
                  "Downgrade"
                ) : plan.price === 0 ? (
                  "Get Started"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
} 