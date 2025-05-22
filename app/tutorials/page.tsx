import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SquareArrowOutUpRight } from "lucide-react";

type TutorialMeta = {
    title: string;
    author: string;
};

type Tutorial = {
    subject: string;
    tutorial: string;
    meta: TutorialMeta;
    firstSlug: string;
};

function getTutorials(): Record<string, Tutorial[]> {
    const subjectsDir = path.join(process.cwd(), "subjects");
    const subjects = fs.readdirSync(subjectsDir).filter((f) =>
        fs.statSync(path.join(subjectsDir, f)).isDirectory()
    );

    const result: Record<string, Tutorial[]> = {};

    for (const subject of subjects) {
        const subjectDir = path.join(subjectsDir, subject);
        const tutorials = fs.readdirSync(subjectDir).filter((f) =>
            fs.statSync(path.join(subjectDir, f)).isDirectory()
        );

        for (const tutorial of tutorials) {
            const tutorialDir = path.join(subjectDir, tutorial);
            const metaPath = path.join(tutorialDir, "meta.json");
            if (!fs.existsSync(metaPath)) continue;
            const meta: TutorialMeta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

            const files = fs
                .readdirSync(tutorialDir)
                .filter(
                    (f) =>
                        (f.endsWith(".md") || f.endsWith(".mdx")) &&
                        f.match(/^01[^/\\]*\.(md|mdx)$/)
                );
            if (files.length === 0) continue;
            const firstFile = files.sort()[0];
            const firstSlug = `/tutorials/${subject}/${tutorial}/${firstFile.replace(
                /\.(md|mdx)$/,
                ""
            )}`;

            if (!result[subject]) result[subject] = [];
            result[subject].push({
                subject,
                tutorial,
                meta,
                firstSlug,
            });
        }
    }

    return result;
}

export default function Tutorials() {
    const tutorialsBySubject = getTutorials();

    return (
        <div className="flex flex-col gap-8 mx-auto my-8 px-4 max-w-7xl">
            <h1 className="font-bold text-4xl mb-6 text-center">Tutorials</h1>
            {Object.entries(tutorialsBySubject).length === 0 ? (
                <p className="text-center text-lg text-muted-foreground block">
                    No tutorials found.
                </p>
            ) : (
                Object.entries(tutorialsBySubject).map(([subject, tutorials]) => (
                    <div key={subject}>
                        <h2 className="mb-2 capitalize text-2xl font-semibold">{subject.replace(/-/g, " ")}</h2>
                        <Separator className="mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                            {tutorials.map((tut) => (
                                <Card key={tut.tutorial}>
                                    <CardContent className="flex items-center justify-between gap-3 p-5 border-0">
                                        <CardTitle className="text-xl font-semibold">
                                            {tut.meta.title}
                                        </CardTitle>
                                        <Button asChild size="sm" variant="outline" className="self-end">
                                            <Link href={tut.firstSlug}>Tutorial <SquareArrowOutUpRight /> </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
