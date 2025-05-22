import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import Link from "next/link";
import PocketBase from "pocketbase";

interface Topic {
    id: string;
    title: string;
    points: number;
    level: number;
}

interface SubjectsDetails {
    id: string;
    title: string;
    topics: Topic[];
}

export default async function Playground() {
    const cookiesList = await cookies();
    const subjectDetails: SubjectsDetails[] = [];

    const pocketbase = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
    pocketbase.authStore.loadFromCookie(cookiesList.toString());

    console.log("Pocketbase Auth Store", pocketbase.authStore);

    const subjects = await pocketbase.collection('subjects').getFullList();

    const topics = await pocketbase.collection('topics').getFullList();

    const gamepoints = await pocketbase.collection('game_points').getFullList({
        filter: `user = "${pocketbase.authStore.model?.id || "xo15eumgn2tov4v"}"`,
    });

    for (const subject of subjects) {
        const subjectDetialsItem: SubjectsDetails = {
            id: subject.id,
            title: subject.title,
            topics: [],
        }
        const subjectTopics = topics.filter((topic) => topic.subject === subject.id);
        for (const topic of subjectTopics) {
            const gamepoint = gamepoints.find((gamepoint) => gamepoint.topic.id === topic.id);
            if (gamepoint) {
                topic.points = gamepoint.points;
                topic.level = gamepoint.level;
            } else {
                topic.points = 0;
                topic.level = 0;
            }
            subjectDetialsItem.topics.push({
                id: topic.id,
                title: topic.title,
                points: topic.points,
                level: topic.level,
            });
        }

        subjectDetails.push(subjectDetialsItem);
    }

    // console.log(subjectDetails);


    return (
        <div className="flex flex-col gap-8 mx-auto my-8 px-4">
            <h1 className="font-bold text-4xl mb-6">Interactive Playground</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                {subjectDetails.map((subject: SubjectsDetails) => (
                    <Card key={subject.id} className="">
                        <CardHeader className=" rounded-t-lg p-5 border-0">
                            <CardTitle className="text-xl font-semibold">{subject.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 p-5 border-0">
                            {subject.topics.length === 0 ? (
                                <div className="flex justify-center items-center bg-muted p-6 rounded-md text-muted-foreground">
                                    <span>No topics available</span>
                                </div>
                            ) : (
                                subject.topics.map((topic) => (
                                    <Link href={`/playground/${subject.title.toLowerCase()}/${topic.title.toLowerCase()}`}
                                        key={topic.id}
                                        className="flex justify-between items-center bg-background border border-border p-3 rounded-md shadow-sm hover:bg-accent transition"
                                    >
                                        <span className="font-medium">{topic.title}</span>
                                        <span className="flex items-center gap-2">
                                            <span className="bg-yellow-200 text-yellow-900 dark:bg-yellow-400/20 dark:text-yellow-400 px-2 py-0.5 rounded text-xs font-semibold">
                                                {topic.points} pts
                                            </span>
                                            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-semibold">
                                                Lv {topic.level}
                                            </span>
                                        </span>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}