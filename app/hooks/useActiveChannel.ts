import { useEffect, useState } from "react";
import useActiveList from "./useActiveList";
import { Channel, Members } from "pusher-js";
import { pusherClient } from "../libs/pusher";

const useActiveChannel = () => {
    const { set, add, remove } = useActiveList();

    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

    // useEffect(() => {
    //     let channel = activeChannel;

    //     if (!channel) {
    //         channel = pusherClient.subscribe('presence-messenger');
    //         setActiveChannel(channel);
    //     }

    //     channel.bind("pusher:subscription_succeeded", (members: Members) => {
    //         const initialMembers: string[] = [];

    //         members.each((member: Record<string, any>) => initialMembers.push(member.id));
    //         set(initialMembers);
    //     })

    //     channel.bind(`pusher:member_added`, (member: Record<string, any>) => {
    //         add(member.id);
    //     })

    //     channel.bind(`pusher:member_removed`, (member: Record<string, any>) => {
    //         remove(member.id);
    //     })

    //     return ()=> {
    //         pusherClient.unsubscribe('presence-messenger');
    //         // pusherClient.unbind('pusher:subscription_succeeded');
    //         // pusherClient.unbind('pusher:member_added');
    //         // pusherClient.unbind('pusher:member_removed');
    //         setActiveChannel(null);
    //     }
    // }, [activeChannel, set, add, remove])

    useEffect(() => {
        if (!activeChannel) return;

        const channel = pusherClient.subscribe('presence-messenger');

        const onSubscriptionSucceeded = (members: Members) => {
            const initialMembers: string[] = [];
            members.each((member: Record<string, any>) => initialMembers.push(member.id));
            set(initialMembers);
        };

        const onMemberAdded = (member: Record<string, any>) => {
            add(member.id);
        };

        const onMemberRemoved = (member: Record<string, any>) => {
            remove(member.id);
        };

        channel.bind('pusher:subscription_succeeded', onSubscriptionSucceeded);
        channel.bind('pusher:member_added', onMemberAdded);
        channel.bind('pusher:member_removed', onMemberRemoved);

        return () => {
            channel.unbind('pusher:subscription_succeeded', onSubscriptionSucceeded);
            channel.unbind('pusher:member_added', onMemberAdded);
            channel.unbind('pusher:member_removed', onMemberRemoved);
            pusherClient.unsubscribe('presence-messenger');
            setActiveChannel(null);
        };
    }, [activeChannel, set, add, remove]); 

}

export default useActiveChannel;