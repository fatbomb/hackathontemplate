import PointsStat from "@/components/interactive/pointsStat";
import ProjectileV2 from "@/components/interactive/projectileV2";
import ProjectileV3 from "@/components/interactive/projectileV3";
import PocketBase from "pocketbase";

interface Points {
    points: number;
    level: number;
}

export default async function EnemyPlanePage() {
    const pocketbase = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

    const points: Points = {
        points:  0,
        level: 0,
    };

    try{
        const game_points = await pocketbase.collection('game_points').getFullList({
            filter: `user = "${pocketbase.authStore.model?.id || "xo15eumgn2tov4v"}" && type = "playground"`,
        });

        if (game_points?.length > 0) {
            points.points = game_points[0].points;
            points.level = game_points[0].level;
        }
    }catch (error) {
        console.error("Error fetching game points:", error);
    }

    return (
        <div className="flex flex-col items-center justify-center mx-20">
            <PointsStat title="Projectile Playground" points={points}/>
            <ProjectileV3 />
        </div>
    )
}