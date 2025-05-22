import PointsStat from "@/components/interactive/pointsStat";
import WorldMap from "@/components/interactive/worldMap";
import PocketBase from "pocketbase";

interface GameLevel {
    id: number;
    name: string;
    unlocked: boolean;
    link: string;
}

interface Points {
    points: number;
    level: number;
}

type Levels = GameLevel[][];

async function getLevels(): Promise<{ points: Points; levels: Levels }> {
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
        return { points, levels: [] };
    }

    const levels: Levels = [
        [
            {
                id: 1,
                name: "Throw away",
                unlocked: points.points >= 0 && points.level >= 0,
                link: "/playground/physics/projectile/throw-away",
            },
            {
                id: 2,
                name: "Hit me if you can",
                unlocked: points.points >= 50 && points.level >= 0,
                link: "/playground/physics/projectile/hit-me-if-you-can",
            },
        ],
        [
            {
                id: 1,
                name: "That's an Enemy Plane!",
                unlocked: points.points >= 100 && points.level >= 1,
                link: "/playground/physics/projectile/enemy-plane",
            },
        ],
    ];
    return { points, levels };
}

export default async function ProjectilePlayground() {
    const { points, levels } = await getLevels();

    return <div className="flex flex-col gap-6 mx-auto my-4">
        <PointsStat title={"Projectile Playground"} points={points}/>
        <WorldMap levels={levels} />
    </div>;
}