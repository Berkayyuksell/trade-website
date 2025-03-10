import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse("Yetkisiz erişim", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    if (!user) {
      return new NextResponse("Kullanıcı bulunamadı", { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.log(error, "USER_GET_ERROR");
    return new NextResponse("Internal Error", { status: 500 });
  }
} 