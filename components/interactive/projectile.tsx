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

    const destination = Bodies.circle(450, 300 - radius - floorHeight, radius, {
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
                const points = localStorage.getItem("projectile_points") || "0";
                if(points === "0"){
                    const newPoints = parseInt(points) + 50;    
                    localStorage.setItem("projectile_points", `${newPoints}`);
                }
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
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 shadow flex flex-col gap-4">
                        <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                            <span role="img" aria-label="target">🎯</span>
                            Challenge Instructions
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            The <span className="font-semibold text-red-500">red ball</span> is at <span className="font-mono">x = 30</span> and the <span className="font-semibold text-green-600">green ball</span> is at <span className="font-mono">x = 450</span>.
                            Adjust the velocity to make the red ball hit the green ball. The ball must hit the green ball before it hits the ground.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 pl-2">
                            <li>
                                <span className="font-medium text-blue-700">Projectile (Red Ball):</span> Starts at <span className="font-mono">x = 30, y = 294</span>
                            </li>
                            <li>
                                <span className="font-medium text-green-700">Destination (Green Ball):</span> Starts at <span className="font-mono">x = 450, y = 6</span>
                            </li>
                            <li>
                                <span className="font-medium text-blue-700">Goal:</span> <span className="font-mono">Hit the green ball before touching the ground</span>
                            </li>
                        </ul>
                        <p className="text-gray-700">
                            Use the input fields to experiment with different velocities and <span className="font-semibold text-blue-700">find the perfect shot!</span>
                        </p>
                    </div>
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
                    <AlertDialogHeader className="flex flex-col items-center gap-3">
                    <AlertDialogTitle>Congratulations!!</AlertDialogTitle>
                    <AlertDialogDescription>
                        You got 50 points!!
                        <DotLottieReact src="/Animation - 1747909504076.lottie" loop autoplay/>
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Link href={"/playground/physics/projectile/hit-me-if-you-can"} className="cursor-pointer">
                            <Button>Next <ArrowRightSquare /> </Button>
                        </Link>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
        </div>
    );
}