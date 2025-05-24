"use client";

import Simulator from "@/components/interactive/simulator";
import { Bodies, Body } from "matter-js";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import { ArrowRightSquare } from "lucide-react";
import { Button } from "../ui/button";
import { savePoints } from "./savePoints";


function ProjectileAssets(velX: number, velY: number) {
    const radius = 5;
    const friction = 100;
    const floorHeight = 1;

    const projectile = Bodies.circle(30, 300 - radius - floorHeight, radius, {
        restitution: 0,
        friction,
        render: {
            fillStyle: "#ff0000",
        },
    });
    projectile.label = "Projectile";

    const destination = Bodies.circle(600, 10 - radius - floorHeight, radius, {
        restitution: 0,
        friction,
        render: {
            fillStyle: "#00ff00",
        },
    });
    destination.label = "Destination";

    const ground = Bodies.rectangle(250, 300, 50000, floorHeight, {
        isStatic: true,
        restitution: 0,
        friction,
        density: 1000,
        render: {
            fillStyle: "#0000ff",
        },
    });
    ground.label = "Ground";

    Body.setVelocity(projectile, {
        x: velX,
        y: velY,
    });

    return [projectile, destination, ground];
}

export default function Projectile() {
    const [velX, setVelX] = useState(3);
    const [velY, setVelY] = useState(-3);
    const [bodies, setBodies] = useState<Body[]>(ProjectileAssets(velX, velY));
    const [clicked, setClicked] = useState(false);
    const [collisionDetected, setCollisionDetected] = useState(false);

    const callback = async (bodyA: Body, bodyB: Body) => {
        if(bodyA.label === "Projectile" && bodyB.label === "Destination") {
            if(clicked || collisionDetected) return;
            setCollisionDetected(true);
            const trigger = document.getElementById("trigger");
            if (trigger) {
                setClicked(true);
                await savePoints(50, 1, "Projectile");
                trigger.click();
            }
        }
        else{

        }
    }

    useEffect(() => {
        const handleVelocityChange = () => {
            setBodies(ProjectileAssets(velX, velY));
        };
        handleVelocityChange();
    }, [velX, velY]);

    return (
        <div className="flex flex-col gap-6 mx-auto my-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Projectile Motion - Throw Away</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-700">
                        The <span className="font-semibold text-red-500">red ball</span> is at x = 30 and the <span className="font-semibold text-green-600">green ball</span> is at x = 450, but will free fall from y = 6 to y = 194. 
                        Adjust the velocity to make the red ball hit the green ball. The ball must hit the green ball before it hits the ground.
                    </p>
                </CardContent>
            </Card>
            <div className="flex md:flex-row flex-col items-start gap-6">
                <Card className="w-full md:w-1/3">
                    <CardHeader>
                        <CardTitle className="text-base">Projectile Velocity Editor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="velX" className="">Velocity X:</label>
                                <input
                                    type="number"
                                    id="velX"
                                    value={velX}
                                    min={-1000}
                                    onChange={(e) => setVelX(parseFloat(e.target.value))}
                                    className="p-1 border border-gray-300 rounded w-24"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="velY" className="">Velocity Y:</label>
                                <input
                                    type="number"
                                    id="velY"
                                    min={-1000}
                                    value={velY}
                                    onChange={(e) => setVelY(parseFloat(e.target.value))}
                                    className="p-1 border border-gray-300 rounded w-24"
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <div className="flex flex-1 justify-center items-center">
                    <div className="bg-gray-100 shadow p-2 rounded">
                        <Simulator callback={callback} bodies={bodies} width={500} height={200} />
                    </div>
                </div>
            </div>
            <AlertDialog>
                <AlertDialogTrigger id="trigger" className="hidden">Open</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Congratulations!!</AlertDialogTitle>
                    <AlertDialogDescription>
                        You got 50 points!! And a Level UP!!!
                        <DotLottieReact src="/Animation - 1747912376235.lottie" loop autoplay/>
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Link href={"/playground/physics/projectile/enemy-plane"}>
                            <Button>Start Level 2 <ArrowRightSquare /> </Button>
                        </Link>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
        </div>
    );
}