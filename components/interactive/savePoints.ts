import PocketBase from "pocketbase";

export async function savePoints(points: number, levelIncrement: number, topic: string){
    try {
        const token = localStorage.getItem('pb_auth');
        const userJSON = localStorage.getItem('pb_user');

        const user = userJSON ? JSON.parse(userJSON) : null;

        console.log("Token:", token);
        console.log("User:", user);

        const pocketbase = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
        if (token) {
            pocketbase.authStore.save(token, user);
        }
        const userId = user.id;
        if (!userId) return;

        const game_points = await pocketbase.collection('game_points').getFullList({
            filter: `user = "${userId}" && type = "playground" && topic = "Projectile"`,
        });

        if (game_points.length > 0) {
            await pocketbase.collection('game_points').update(game_points[0].id, {
                points: (game_points[0].points || 0) + points,
                level: (game_points[0].level || 0) + levelIncrement,
            });
        } else {
            await pocketbase.collection('game_points').create({
                user: userId,
                type: "playground",
                points: points,
                level: 0,
                topic: topic,
            });
        }
    } catch (error) {
        console.error("Error updating game points:", error);
    }
}