import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();

        const body = await request.json();
        const { userId, isGroup, members, name } = body;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (isGroup && (!name || !members || members.length < 2)) {
            return new NextResponse('Invalid Request', { status: 400 })
        }

        if (isGroup) {
            const newConversation = await prisma.conversation.create({
                data: {
                    name,
                    isGroup,
                    users: {
                        connect: [
                            ...members.map((member: { value: string }) => ({
                                id: member.value
                            })),
                            {
                                id: currentUser.id
                            }
                        ]
                    },
                },
                include: {
                    users: true
                }
            });

            newConversation.users.forEach(async (user) => {
                if (user.email) {
                    await pusherServer.trigger(user.email, 'conversation:new', newConversation)
                }
            })

            return NextResponse.json(newConversation, { status: 201 })
        }

        const existingConversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { userIds: { equals: [currentUser.id, userId] } },
                    { userIds: { equals: [userId, currentUser.id] } }
                ]
            }
        })

        const singleConversation = existingConversations[0];

        if (singleConversation) {
            return NextResponse.json(singleConversation, { status: 200 })
        }

        const newConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [{ id: currentUser.id }, { id: userId }]
                }
            },
            include: {
                users: true
            }
        })

        newConversation.users.map((user)=> {
            if(user.email){
                pusherServer.trigger(user.email, 'conversation:new', newConversation)
            }
        })

        return NextResponse.json(newConversation, { status: 201 })
    } catch (error) {
        console.log("Conversation Post Error: ", error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}