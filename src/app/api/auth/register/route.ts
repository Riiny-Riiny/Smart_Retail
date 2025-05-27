import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, organizationName, organizationSlug } = await request.json()

    // Validation
    if (!name || !email || !password || !organizationName || !organizationSlug) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check if organization slug is taken
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: organizationSlug }
    })

    if (existingOrg) {
      return NextResponse.json(
        { message: "Organization URL is already taken" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and organization in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER"
        }
      })

      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationSlug,
          plan: "FREE",
          status: "ACTIVE",
          createdById: user.id
        }
      })

      // Add user as owner of the organization
      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
          status: "ACTIVE",
          joinedAt: new Date()
        }
      })

      // Create free subscription
      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          plan: "FREE",
          status: "ACTIVE"
        }
      })

      return { user, organization }
    })

    return NextResponse.json(
      { 
        message: "Account created successfully",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
} 