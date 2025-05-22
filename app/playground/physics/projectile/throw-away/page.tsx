import PointsStat from "@/components/interactive/pointsStat";
import Projectile from "@/components/interactive/projectile";
import { getPocketBase } from "@/lib/pocketbase";
import {  headers } from "next/headers";

interface Points {
    points: number;
    level: number;
}

export default async function ThrowAwayPage() {
    const headerList = await headers();
    const cookie = headerList.get("cookie");
    
    const points: Points = {
        points:  0,
        level: 0,
    };

    try{
        const pocketbase = await getPocketBase(cookie || "");
        console.log("PocketBase instance:", pocketbase.authStore.record);
        const game_points = await pocketbase.collection('game_points').getFullList({
            filter: `user = "${pocketbase.authStore.record?.id}" && type = "playground" && topic = "Projectile"`,
        });

        if (game_points?.length > 0) {
            points.points = game_points[0].points;
            points.level = game_points[0].level;
        }
    }catch (error) {
        console.error("Error fetching game points:", error);
    }

    return (
        <div className="flex flex-col items-center justify-center mx-auto">
            <PointsStat title="Projectile Playground" points={points}/>
            <Projectile />
        </div>
    )
}